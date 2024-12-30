import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import { PhoneNumberProps } from "../cache/route";

export async function PATCH(request: Request) {
  const {
    cache: { reports },
    page_id,
  } = (await request.json()) as {
    page_id: string;
    cache: PhoneNumberProps;
  };

  const reportsTotal = reports.length;
  const whistleblowers = reports.map((rprt) => rprt.whistleblower);

  try {
    const notion = new Client({ auth: process.env.NOTION_SECRET });
    const response = await notion.pages.update({
      page_id,
      properties: {
        "Quantidade de Reports": {
          number: reportsTotal,
        },
        "Usuários que Reportaram": {
          multi_select: whistleblowers.map((user) => ({ name: user.email })),
        },
        "Data do Último Report": {
          date: { start: new Date().toISOString() },
        },
      },
    });

    if (!response) {
      throw new Error("Failed to update report in Notion!");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<
  NextResponse<{
    success: boolean;
    page_id?: string;
  }>
> {
  const { phoneNumber, whistleblower } = await request.json();
  try {
    const notion = new Client({ auth: process.env.NOTION_SECRET });
    const response = await notion.pages.create({
      parent: {
        database_id: `${process.env.NOTION_DB}`,
      },
      properties: {
        "Número de Telefone": { title: [{ text: { content: phoneNumber } }] },
        "Quantidade de Reports": { number: 1 },
        "Usuários que Reportaram": {
          multi_select: [{ name: whistleblower.email }],
        },
        "Data do Último Report": { date: { start: new Date().toISOString() } },
      },
    });

    if (!response) {
      throw new Error("Failed to add report to Notion!");
    }

    return NextResponse.json(
      { success: true, page_id: response.id },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
