export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          {children}
        </table>
      </div>
    </div>
  );
}
