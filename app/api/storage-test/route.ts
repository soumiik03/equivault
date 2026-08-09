import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.storage
    .from("bearing-documents")
    .list();

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    files: data,
  });
}