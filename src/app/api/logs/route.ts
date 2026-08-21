import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn({ msg: "Unauthorized log submission attempt", ip: req.headers.get("x-forwarded-for") });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.text();
    
    if (body.length > 2048) {
      logger.warn({ msg: "Log payload too large", userId: user.id });
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    let logData;
    try {
      logData = JSON.parse(body);
    } catch {
      logger.warn({ msg: "Invalid JSON log payload", userId: user.id });
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    const { level = "info", message, context = {} } = logData;
    
    const logContext = {
      userId: user.id,
      ...context,
      source: "client"
    };

    switch (level) {
      case "error":
      case "fatal":
        logger.error(logContext, message);
        break;
      case "warn":
        logger.warn(logContext, message);
        break;
      case "debug":
        logger.debug(logContext, message);
        break;
      default:
        logger.info(logContext, message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Failed to process client log");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
