import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

/**
 * Check if an email is approved for signup
 * @param email - Email address to validate
 * @returns true if email is approved or APPROVED_EMAILS is empty/undefined (open signup mode)
 */
function isEmailApproved(email: string): boolean {
  const approvedEmails = process.env.APPROVED_EMAILS

  // If APPROVED_EMAILS is not set or empty, allow all signups (open mode)
  if (!approvedEmails || approvedEmails.trim() === "") {
    return true
  }

  // Parse approved emails list: split by comma, trim whitespace, convert to lowercase
  const approvedList = approvedEmails
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(e => e.length > 0)

  // Check if submitted email is in approved list (case-insensitive)
  const normalizedEmail = email.trim().toLowerCase()
  return approvedList.includes(normalizedEmail)
}

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

    // Validate email against approved list
    if (!isEmailApproved(email)) {
      return NextResponse.json(
        { message: "This email address is not approved for signup. Contact your administrator for access." },
        { status: 403 }
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
