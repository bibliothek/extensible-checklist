import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate inputs
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Valid email is required" },
        { status: 400 }
      )
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    // Handle unique constraint violation (duplicate email)
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      )
    }

    console.error("Signup error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
