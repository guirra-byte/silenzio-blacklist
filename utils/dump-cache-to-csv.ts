import { formattedDate } from "@/app/reports/page";
import { redis } from "./cache";
import fs from "node:fs";
import csv from "fast-csv";
import { nanoid } from "nanoid";

interface DumpPropsHead {
  id: string;
  rowsCount: number;
  dumps: {
    backup?: DumpProps;
    latest?: DumpProps;
  };
}

interface DumpProps {
  id: string;
  dumpedAt?: Date;
  file: { version: string; name: string; path: string };
}

interface CsvWriteRow {
  at: string;
  reason: string;
  phoneNumber: string;
}

interface CsvReadRow {
  at: string;
  key: string;
  reason: string;
  phoneNumber: string;
}

const limitCsvDump = 50;
export const dumpCacheToCsv = async () => {
  await redis()
    .get("threshold_csv_dump")
    .then(async (dump: any) => {
      if (dump) {
        const parsePayload = JSON.parse(dump) as DumpPropsHead;
        const dumpBatch = parsePayload.rowsCount / limitCsvDump;

        if (parsePayload.rowsCount % limitCsvDump === 0) {
          await fetch("/api/cache", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }).then(async (reply) => {
            const msg = (await reply.json()).message as string[];
            const writeRows: CsvWriteRow[] = [];

            msg.map((strObj) => {
              const data = JSON.parse(strObj);
              const at = formattedDate(data.at);
              writeRows.push({
                phoneNumber: data.phoneNumber,
                reason: data.reason,
                at,
              });
            });

            try {
              const generatedDump = {
                id: nanoid,
                dumpedAt: new Date(),
                file: { version: `${limitCsvDump}.${dumpBatch}` },
              };

              if (!parsePayload.dumps.backup) {
                const ws = fs.createWriteStream("");
                csv
                  .write(writeRows, {
                    headers: ["phone_number", "reason", "at"],
                  })
                  .pipe(ws);

                await redis().set("threshold_csv_dump", {
                  ...parsePayload,
                  rowsCount: parsePayload.rowsCount + limitCsvDump,
                  dumps: { backup: generatedDump, latest: undefined },
                });
              } else {
                let rowsToMerge: CsvWriteRow[] = [];
                const {
                  file: { name, path },
                } = parsePayload.dumps.backup;

                fs.createReadStream(path)
                  .pipe(
                    csv.parse({ headers: ["phone_number", "reason", "at"] }),
                  )
                  .on("data", (backupRows: CsvReadRow[]) => {
                    writeRows.map((row) => {
                      const backupRow = backupRows.find(
                        (_row) => _row.phoneNumber === row.phoneNumber,
                      );

                      if (!backupRow) rowsToMerge.push({ ...row });
                    });

                    rowsToMerge = [...rowsToMerge, ...backupRows];
                    const updatedDumpHead: DumpPropsHead = {
                      ...parsePayload,
                      rowsCount: parsePayload.rowsCount + limitCsvDump,
                    };

                    updatedDumpHead.dumps.backup = updatedDumpHead.dumps.latest;

                    fs.rm(path, async (err) => {
                      if (err) throw err;

                      const ws = fs.createWriteStream(path);
                      csv
                        .write(rowsToMerge, {
                          headers: ["phone_number", "reason", "at"],
                        })
                        .pipe(ws);

                      updatedDumpHead.dumps = {
                        latest: {
                          id: nanoid(),
                          file: {
                            version: `${limitCsvDump}.${updatedDumpHead.rowsCount}`,
                            path,
                            name,
                          },
                          dumpedAt: new Date(),
                        },
                      };

                      await redis().set("threshold_csv_dump", updatedDumpHead);
                      return;
                    });
                  });
              }
            } catch (error) {
              console.error("Não foi possível exportar os dados: ", error);
            }
          });
        } else {
          return;
        }
      } else {
        await redis().set("threshold_csv_dump", {
          id: nanoid(),
          rowsCount: 0,
          dumps: { backup: undefined, latest: undefined },
        });
      }
    });
};
