import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/immigration/detainees
// List detainees with facility info, contact info, and communications
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
    const facilityId = searchParams.get("facilityId");
    const bondStatus = searchParams.get("bondStatus");

    const where: any = {
      organizationId,
    };

    if (facilityId) {
      where.currentFacilityId = facilityId;
    }

    if (bondStatus) {
      where.bondStatus = bondStatus;
    }

    const detainees = await prisma.detainee.findMany({
      where,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            altPhone: true,
            aNumber: true,
            dateOfBirth: true,
            countryOfBirth: true,
            countryOfCitizenship: true,
            currentImmigrationStatus: true,
            language: true,
          },
        },
        facility: {
          select: {
            id: true,
            name: true,
            type: true,
            addressLine1: true,
            city: true,
            state: true,
            zipCode: true,
            phone: true,
            fax: true,
            iceFieldOffice: true,
            visitationHours: true,
          },
        },
        matter: {
          select: {
            id: true,
            title: true,
            matterNumber: true,
            status: true,
          },
        },
        communications: {
          orderBy: { date: "desc" },
          take: 10,
          select: {
            id: true,
            type: true,
            date: true,
            summary: true,
            contactedBy: true,
            createdAt: true,
          },
        },
        transfers: {
          orderBy: { transferDate: "desc" },
          take: 10,
          select: {
            id: true,
            fromFacilityId: true,
            toFacilityId: true,
            transferDate: true,
            notes: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform into a cleaner response shape
    const result = detainees.map((d) => ({
      id: d.id,
      aNumber: d.aNumber ?? d.contact.aNumber,
      bookingNumber: d.bookingNumber,
      legalStatus: d.legalStatus,
      bondStatus: d.bondStatus,
      bondAmount: d.bondAmount,
      bondConditions: d.bondConditions,
      nextHearingDate: d.nextHearingDate,
      releaseDate: d.releaseDate,
      notes: d.notes,
      contact: {
        id: d.contact.id,
        firstName: d.contact.firstName,
        lastName: d.contact.lastName,
        email: d.contact.email,
        phone: d.contact.phone,
        altPhone: d.contact.altPhone,
        dateOfBirth: d.contact.dateOfBirth,
        countryOfBirth: d.contact.countryOfBirth,
        countryOfCitizenship: d.contact.countryOfCitizenship,
        currentImmigrationStatus: d.contact.currentImmigrationStatus,
        language: d.contact.language,
      },
      facility: d.facility
        ? {
            id: d.facility.id,
            name: d.facility.name,
            type: d.facility.type,
            address: d.facility.addressLine1,
            city: d.facility.city,
            state: d.facility.state,
            zipCode: d.facility.zipCode,
            phone: d.facility.phone,
            fax: d.facility.fax,
            iceFieldOffice: d.facility.iceFieldOffice,
            visitationHours: d.facility.visitationHours,
          }
        : null,
      matter: d.matter
        ? {
            id: d.matter.id,
            title: d.matter.title,
            matterNumber: d.matter.matterNumber,
            status: d.matter.status,
          }
        : null,
      communications: d.communications,
      transfers: d.transfers,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    return NextResponse.json({ detainees: result });
  } catch (error) {
    console.error("[GET /api/immigration/detainees]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/immigration/detainees
// Create a new detainee record linked to a contact and optionally a matter
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
    const {
      contactId,
      matterId,
      aNumber,
      bookingNumber,
      currentFacilityId,
      legalStatus,
      bondStatus,
      bondAmount,
      bondConditions,
      nextHearingDate,
      notes,
    } = body;

    // Validate required fields
    if (!contactId) {
      return NextResponse.json(
        { error: "contactId is required" },
        { status: 400 }
      );
    }

    // Verify the contact belongs to the organization
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        organizationId,
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found or access denied" },
        { status: 404 }
      );
    }

    // If matterId is provided, verify it belongs to the organization
    if (matterId) {
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
    }

    // If facilityId is provided, verify it exists
    if (currentFacilityId) {
      const facility = await prisma.facility.findUnique({
        where: { id: currentFacilityId },
      });

      if (!facility) {
        return NextResponse.json(
          { error: "Facility not found" },
          { status: 404 }
        );
      }
    }

    // Check for existing detainee record for this contact
    const existing = await prisma.detainee.findUnique({
      where: { contactId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A detainee record already exists for this contact" },
        { status: 409 }
      );
    }

    // Create the detainee record
    const detainee = await prisma.detainee.create({
      data: {
        organizationId,
        contactId,
        matterId: matterId ?? null,
        aNumber: aNumber ?? null,
        bookingNumber: bookingNumber ?? null,
        currentFacilityId: currentFacilityId ?? null,
        legalStatus: legalStatus ?? null,
        bondStatus: bondStatus ?? null,
        bondAmount: bondAmount != null ? parseFloat(bondAmount) : null,
        bondConditions: bondConditions ?? null,
        nextHearingDate: nextHearingDate ? new Date(nextHearingDate) : null,
        notes: notes ?? null,
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        facility: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
        matter: {
          select: {
            id: true,
            title: true,
            matterNumber: true,
          },
        },
      },
    });

    return NextResponse.json({ detainee }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/immigration/detainees]", error);

    // Handle unique constraint violation (contactId is @unique)
    if ((error as any)?.code === "P2002") {
      return NextResponse.json(
        { error: "A detainee record already exists for this contact" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
