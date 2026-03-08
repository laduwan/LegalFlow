import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getOrgId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as any).organizationId as string | undefined;
}

// ---------------------------------------------------------------------------
// GET /api/contacts/[id] — single contact with matters & documents
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contact = await prisma.contact.findFirst({
      where: { id: params.id, organizationId },
      include: {
        matterContacts: {
          include: {
            matter: {
              select: {
                id: true,
                matterNumber: true,
                title: true,
                status: true,
                type: true,
                openDate: true,
                closeDate: true,
              },
            },
          },
        },
        documents: {
          select: {
            id: true,
            filename: true,
            documentType: true,
            fileSize: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("GET /api/contacts/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/contacts/[id] — update contact
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the contact belongs to this organization
    const existing = await prisma.contact.findFirst({
      where: { id: params.id, organizationId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Build update data
    const data: any = {};

    // String fields
    const stringFields = [
      "type",
      "firstName",
      "middleName",
      "lastName",
      "suffix",
      "preferredName",
      "companyName",
      "email",
      "phone",
      "altPhone",
      "fax",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "zipCode",
      "country",
      "language",
      "communicationPreference",
      "aNumber",
      "countryOfBirth",
      "countryOfCitizenship",
      "currentImmigrationStatus",
      "passportNumber",
      "notes",
    ];

    for (const field of stringFields) {
      if (field in body) {
        data[field] = body[field]?.trim() || null;
      }
    }

    // Date fields
    const dateFields = [
      "dateOfBirth",
      "entryDate",
      "visaExpirationDate",
      "workAuthExpiration",
      "passportExpiration",
    ];

    for (const field of dateFields) {
      if (field in body) {
        if (body[field]) {
          const parsed = new Date(body[field]);
          data[field] = !isNaN(parsed.getTime()) ? parsed : null;
        } else {
          data[field] = null;
        }
      }
    }

    // Boolean fields
    if ("isOrganization" in body) {
      data.isOrganization = Boolean(body.isOrganization);
    }
    if ("portalEnabled" in body) {
      data.portalEnabled = Boolean(body.portalEnabled);
    }

    const updated = await prisma.contact.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/contacts/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/contacts/[id] — delete contact
// ---------------------------------------------------------------------------

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.contact.findFirst({
      where: { id: params.id, organizationId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Check for related records that would prevent deletion
    const matterCount = await prisma.matterContact.count({
      where: { contactId: params.id },
    });

    if (matterCount > 0) {
      // Soft-delete: just deactivate portal and clear PII markers,
      // but keep the record for referential integrity
      await prisma.contact.update({
        where: { id: params.id },
        data: {
          portalEnabled: false,
          notes: `[DELETED] ${existing.notes ?? ""}`.trim(),
        },
      });

      return NextResponse.json({
        message:
          "Contact has associated matters and was soft-deleted. Record preserved for referential integrity.",
        softDeleted: true,
      });
    }

    // Hard delete if no related matters
    await prisma.contact.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/contacts/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
