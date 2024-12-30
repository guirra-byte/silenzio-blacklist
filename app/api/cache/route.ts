import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { reportCacheKeys, redis } from "@/utils/cache";

// const resend = new Resend(process.env.RESEND_API_KEY);
// const ratelimit = new Ratelimit({
//   redis,
//   // 2 requests per minute from the same IP address in a sliding window of 1 minute duration which means that the window slides forward every second and the rate limit is reset every minute for each IP address.
//   limiter: Ratelimit.slidingWindow(2, "1 m"),
// });

export interface WhistleblowerProps {
  name: string;
  email: string;
}

export interface ReportProps {
  at: Date;
  reason?: string;
  phoneNumber: string;
  whistleblower: WhistleblowerProps;
}

export interface PhoneNumberProps {
  reports: ReportProps[];
}

export interface CachePaginationProps {
  from: number;
  to: number;
}

export async function GET(request: NextRequest, response: NextResponse) {
  let data: string[] = [];

  try {
    const getByKey = async (key: string) => {
      return new Promise(async (resolve, reject) => {
        await redis()
          .get(key)
          .then((reply: any) => {
            if (!reply) return reject("Cannot find data!");
            return resolve(reply);
          });
      });
    };

    await reportCacheKeys().then(async (keys) => {
      const results = keys.map(async (key) => {
        return getByKey(key);
      });

      await Promise.allSettled(results).then((_results) => {
        _results.map((result) => {
          if (result.status === "rejected") {
            throw new Error(result.reason);
          } else if (result.status === "fulfilled" && result.value) {
            data.push(JSON.stringify(result.value));
          }
        });
      });
    });
    
    return NextResponse.json({ message: data });
  } catch (error) {
    return NextResponse.json({ message: error });
  }
}

export async function POST(request: NextRequest, _: NextResponse) {
  const { phoneNumber, whistleblower, reason } = (await request.json()) as {
    phoneNumber: string;
    whistleblower: { name: string; email: string };
    reason: string;
  };

  try {
    const currentPhoneNumber = (await redis().get(
      phoneNumber,
    )) as PhoneNumberProps;

    let reply: { msg: string; didReport: boolean } = {
      msg: "",
      didReport: false,
    };

    if (currentPhoneNumber) {
      const didReport = currentPhoneNumber.reports.find(
        (report) => report.whistleblower.email === whistleblower.email,
      );

      if (didReport) {
        reply = {
          msg: "You already reported this Phone Number!",
          didReport: true,
        };
      }

      if (!reply.didReport) {
        const totalReports = currentPhoneNumber.reports.length;
        reply.msg = `This current Phone Number had ${totalReports} and couting...`;
      }
    } else {
      await redis().set(phoneNumber, {
        at: new Date(),
        whistleblower,
        phoneNumber: phoneNumber,
        reason,
      });
    }

    return NextResponse.json({ message: reply.msg });
  } catch (error) {
    return NextResponse.json({ message: error });
  }
}

// export async function POST(request: NextRequest, response: NextResponse) {
//   const ip = request.ip ?? "127.0.0.1";

//   const result = await ratelimit.limit(ip);

//   if (!result.success) {
//     return Response.json(
//       {
//         error: "Too many requests!!",
//       },
//       {
//         status: 429,
//       },
//     );
//   }

//   const { email, firstname } = await request.json();

//   const { data, error } = await resend.emails.send({
//     from: "Lakshay<hello@waitlist.lakshb.dev>",
//     to: [email],
//     subject: "Thankyou for wailisting the Next.js + Notion CMS template!",
//     reply_to: "lakshb.work@gmail.com",
//     html: await render(WelcomeTemplate({ userFirstname: firstname })),
//   });

//   // const { data, error } = { data: true, error: null }

//   if (error) {
//     return NextResponse.json(error);
//   }

//   if (!data) {
//     return NextResponse.json({ message: "Failed to send email" });
//   }

//   return NextResponse.json({ message: "Email sent successfully" });
// }
