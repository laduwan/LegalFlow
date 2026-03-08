import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { USCIS_FORMS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// GET /api/immigration/forms
// List immigration forms with optional filters: status, type, matterId
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId } = session.user as any;
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const formType = searchParams.get("type");
    const matterId = searchParams.get("matterId");

    // Build where clause — scope by organization through the matter relation
    const where: any = {
      matter: {
        organizationId,
      },
    };

    if (status) {
      where.status = status;
    }

    if (formType) {
      where.formType = formType;
    }

    if (matterId) {
      where.matterId = matterId;
    }

    const forms = await prisma.immigrationForm.findMany({
      where,
      include: {
        matter: {
          select: {
            id: true,
            title: true,
            matterNumber: true,
            primaryClientId: true,
            matterContacts: {
              where: { role: "client" },
              take: 1,
              include: {
                contact: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform response to include matter title and client name at top level
    const result = forms.map((form) => {
      const clientContact = form.matter.matterContacts[0]?.contact;
      return {
        id: form.id,
        matterId: form.matterId,
        matterTitle: form.matter.title,
        matterNumber: form.matter.matterNumber,
        clientName: clientContact
          ? `${clientContact.firstName ?? ""} ${clientContact.lastName ?? ""}`.trim()
          : null,
        clientId: clientContact?.id ?? null,
        formType: form.formType,
        formVersion: form.formVersion,
        status: form.status,
        receiptNumber: form.receiptNumber,
        filedDate: form.filedDate,
        receivedDate: form.receivedDate,
        approvedDate: form.approvedDate,
        deniedDate: form.deniedDate,
        rfeDate: form.rfeDate,
        rfeResponseDeadline: form.rfeResponseDeadline,
        reviewedBy: form.reviewedBy,
        reviewedAt: form.reviewedAt,
        notes: form.notes,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
      };
    });

    return NextResponse.json({ forms: result });
  } catch (error) {
    console.error("[GET /api/immigration/forms]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/immigration/forms
// Create a new immigration form filing
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId } = session.user as any;
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { matterId, formType, status, notes, formVersion, formData } = body;

    // Validate required fields
    if (!matterId || !formType) {
      return NextResponse.json(
        { error: "matterId and formType are required" },
        { status: 400 }
      );
    }

    // Validate form type against known USCIS forms
    const validFormTypes = USCIS_FORMS.map((f) => f.value);
    if (!validFormTypes.includes(formType)) {
      return NextResponse.json(
        {
          error: `Invalid form type "${formType}". Must be one of: ${validFormTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Ensure the matter belongs to the user's organization
    const matter = await prisma.matter.findFirst({
      where: {
        id: matterId,
        organizationId,
      },
    });

    if (!matter) {
      return NextResponse.json(
        { error: "Matter not found or access denied" },
        { status: 404 }
      );
    }

    // Create the immigration form record
    const form = await prisma.immigrationForm.create({
      data: {
        matterId,
        formType,
        status: status ?? "NOT_STARTED",
        notes: notes ?? null,
        formVersion: formVersion ?? null,
        formData: formData ?? null,
      },
      include: {
        matter: {
          select: {
            id: true,
            title: true,
            matterNumber: true,
          },
        },
      },
    });

    return NextResponse.json({ form }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/immigration/forms]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
