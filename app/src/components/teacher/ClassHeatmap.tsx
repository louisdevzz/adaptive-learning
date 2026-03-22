"use client";

interface StudentCell {
  studentId: string;
  fullName: string;
  avgMastery: number;
  engagementScore: number;
  riskKpsCount: number;
}

function getCellClass(mastery: number) {
  if (mastery >= 80) return "bg-green-100 text-green-700";
  if (mastery >= 60) return "bg-blue-100 text-blue-700";
  if (mastery >= 40) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}

export function ClassHeatmap({
  students,
}: {
  students: StudentCell[];
}) {
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-[#717680] border-b border-[#e9eaeb]">
            <th className="py-2 pr-3">Học sinh</th>
            <th className="py-2 pr-3">Mức thành thạo</th>
            <th className="py-2 pr-3">Mức tham gia</th>
            <th className="py-2 pr-3">KP rủi ro</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.studentId} className="border-b border-[#f2f4f7]">
              <td className="py-2 pr-3 font-medium">{student.fullName}</td>
              <td className="py-2 pr-3">
                <span
                  className={`inline-flex rounded-md px-2 py-1 font-medium ${getCellClass(
                    student.avgMastery,
                  )}`}
                >
                  {student.avgMastery}%
                </span>
              </td>
              <td className="py-2 pr-3">{student.engagementScore}%</td>
              <td className="py-2 pr-3">{student.riskKpsCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
