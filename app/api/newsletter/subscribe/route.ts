import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const { email, name, genre_preference, source } = await req.json();

        // Basic validation
        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email is required." },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json(
                { error: "Please enter a valid email address." },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from("newsletter_subscribers")
            .insert({
                email: email.trim().toLowerCase(),
                name: name?.trim() || null,
                genre_preference: genre_preference || "all",
                source: source || "navbar",
            });

        if (error) {
            // Duplicate email — already subscribed
            if (error.code === "23505") {
                return NextResponse.json(
                    { message: "You're already subscribed! 🎉" },
                    { status: 200 }
                );
            }
            console.error("Newsletter subscribe error:", error);
            return NextResponse.json(
                { error: "Something went wrong. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "You're subscribed! Welcome to PDF Lovers 📚" },
            { status: 200 }
        );
    } catch (err) {
        console.error("Newsletter route error:", err);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
