import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/documents
// List documents with filters. Scoped by organizationId.
// Supports: matterId, contactId, type, search, pagination.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10))
    );
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search")?.trim() ?? "";
    const matterId = searchParams.get("matterId") ?? "";
    const contactId = searchParams.get("contactId") ?? "";
    const documentType = searchParams.get("documentType") ?? searchParams.get("type") ?? "";
    const tags = searchParams.get("tags") ?? "";

    // Build where clause
    const where: any = { organizationId };

    if (matterId) {
      where.matterId = matterId;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (documentType) {
      where.documentType = documentType;
    }

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: "insensitive" } },
        { originalFilename: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        where.tags = { hasSome: tagList };
      }
    }

    // Execute queries in parallel
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          matter: {
            select: {
              id: true,
              title: true,
              matterNumber: true,
            },
          },
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    // Transform to include flattened uploader name
    const transformed = documents.map((doc) => ({
      id: doc.id,
      filename: doc.filename,
      originalFilename: doc.originalFilename,
      filePath: doc.filePath,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      documentType: doc.documentType,
      version: doc.version,
      description: doc.description,
      tags: doc.tags,
      isClientVisible: doc.isClientVisible,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      uploaderName: `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}`.trim(),
      uploadedById: doc.uploadedBy.id,
      matter: doc.matter
        ? {
            id: doc.matter.id,
            title: doc.matter.title,
            matterNumber: doc.matter.matterNumber,
          }
        : null,
      contact: doc.contact
        ? {
            id: doc.contact.id,
            name: `${doc.contact.firstName ?? ""} ${doc.contact.lastName ?? ""}`.trim(),
          }
        : null,
    }));

    return NextResponse.json({
      documents: transformed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error listing documents:", error);
    return NextResponse.json(
      { error: "Failed to list documents" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/documents
// Create document metadata. In production, actual file upload would be handled
// by a separate multipart handler (e.g., presigned S3 URL workflow).
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;
    const userId = (session.user as any).id;
    const body = await request.json();

    const {
      filename,
      originalFilename,
      filePath,
      fileSize,
      mimeType,
      documentType,
      matterId,
      contactId,
      description,
      tags = [],
      isClientVisible = false,
    } = body;

    // Validation
    if (!filename || !filePath || !documentType) {
      return NextResponse.json(
        { error: "filename, filePath, and documentType are required" },
        { status: 400 }
      );
    }

    // If matterId is provided, verify it belongs to the same organization
    if (matterId) {
      const matter = await prisma.matter.findFirst({
        where: { id: matterId, organizationId },
        select: { id: true },
      });
      if (!matter) {
        return NextResponse.json(
          { error: "Matter not found or access denied" },
          { status: 404 }
        );
      }
    }

    // If contactId is provided, verify it belongs to the same organization
    if (contactId) {
      const contact = await prisma.contact.findFirst({
        where: { id: contactId, organizationId },
        select: { id: true },
      });
      if (!contact) {
        return NextResponse.json(
          { error: "Contact not found or access denied" },
          { status: 404 }
        );
      }
    }

    const document = await prisma.document.create({
      data: {
        organizationId,
        filename,
        originalFilename: originalFilename ?? filename,
        filePath,
        fileSize: fileSize ?? 0,
        mimeType: mimeType ?? "application/octet-stream",
        documentType,
        description: description ?? null,
        tags,
        isClientVisible,
        matterId: matterId ?? null,
        contactId: contactId ?? null,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        document: {
          ...document,
          uploaderName: `${document.uploadedBy.firstName} ${document.uploadedBy.lastName}`.trim(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
