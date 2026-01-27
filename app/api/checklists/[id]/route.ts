import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const params = await context.params
    const body = await request.json()

    // Check if checklist exists and user owns it
    const existingChecklist = await db.checklist.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingChecklist) {
      return NextResponse.json(
        { message: "Checklist not found" },
        { status: 404 }
      )
    }

    // Update checklist with hideCompleted if provided
    const updatedChecklist = await db.checklist.update({
      where: {
        id: params.id,
      },
      data: {
        hideCompleted: body.hideCompleted !== undefined ? body.hideCompleted : existingChecklist.hideCompleted,
      },
      include: {
        items: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    return NextResponse.json(updatedChecklist, { status: 200 })
  } catch (error: any) {
    console.error("Update checklist error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const params = await context.params

    // Check if checklist exists and user owns it
    const existingChecklist = await db.checklist.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingChecklist) {
      return NextResponse.json(
        { message: "Checklist not found" },
        { status: 404 }
      )
    }

    // Delete checklist (cascade will delete items)
    await db.checklist.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json(
      { message: "Checklist deleted successfully" },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Delete checklist error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
