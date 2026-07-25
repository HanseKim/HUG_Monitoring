import { useRef, useState } from "react";
import Papa from "papaparse";
import { Button, Card, Table, Th, Td } from "@/shared/ui";

export type CsvRow = Record<string, string>;

type Props = {
  requiredColumns: readonly string[];
  /** 일괄 실행 버튼 라벨 생성 */
  actionLabel: (count: number) => string;
  accentBg: string;
  loading?: boolean;
  onSubmit: (rows: CsvRow[]) => void;
};

/** CSV 드롭존 → papaparse 파싱 → 미리보기(최대 10행) → 컬럼 검증 → 일괄 실행 */
export function CsvUpload({ requiredColumns, actionLabel, accentBg, loading, onSubmit }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const missing = requiredColumns.filter((c) => !columns.includes(c));
  const ready = rows.length > 0 && missing.length === 0 && !parseError;

  const parseFile = (file: File) => {
    setFileName(file.name);
    setParseError(null);
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0 && result.data.length === 0) {
          setParseError("CSV를 읽을 수 없습니다. UTF-8 인코딩과 쉼표 구분 형식인지 확인해주세요.");
          setRows([]);
          setColumns([]);
          return;
        }
        setColumns(result.meta.fields ?? []);
        setRows(result.data);
      },
      error: () => {
        setParseError("파일을 읽는 중 문제가 발생했습니다. 파일을 다시 선택해주세요.");
      },
    });
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) parseFile(file);
        }}
        onClick={() => fileRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed px-6 py-10 text-center transition-colors duration-fast ${
          dragOver ? "border-primary bg-primary-soft" : "border-hairline bg-surface hover:bg-canvas"
        }`}
      >
        <p className="text-[14px] font-bold text-label">
          {fileName ?? "CSV 파일을 끌어다 놓거나 클릭해서 선택"}
        </p>
        <p className="mt-1 text-[12px] text-muted">
          필수 컬럼: {requiredColumns.join(", ")}
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) parseFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {parseError && (
        <p className="rounded-lg bg-grade-danger-soft px-4 py-3 text-[13px] font-bold text-grade-danger">
          {parseError}
        </p>
      )}

      {rows.length > 0 && missing.length > 0 && (
        <p className="rounded-lg bg-grade-danger-soft px-4 py-3 text-[13px] text-grade-danger">
          <b>필수 컬럼 누락:</b> {missing.join(", ")} — CSV 헤더를 확인한 뒤 다시 업로드해주세요.
        </p>
      )}

      {rows.length > 0 && missing.length === 0 && (
        <Card className="p-4">
          <Table>
            <thead>
              <tr>
                {columns.map((c) => (
                  <Th key={c}>{c}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 10).map((row, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <Td key={c}>{row[c]}</Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
          {rows.length > 10 && (
            <p className="mt-2 text-right text-[12px] text-muted">외 {rows.length - 10}건</p>
          )}
        </Card>
      )}

      {ready && (
        <div className="flex justify-end">
          <Button accentBg={accentBg} loading={loading} onClick={() => onSubmit(rows)}>
            {actionLabel(rows.length)}
          </Button>
        </div>
      )}
    </div>
  );
}
