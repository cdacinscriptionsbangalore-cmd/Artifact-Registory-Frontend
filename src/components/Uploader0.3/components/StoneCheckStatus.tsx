interface StoneCheckStatusProps {
  isChecking: boolean;
  result: string | null;
}

export const StoneCheckStatus = ({ isChecking, result }: StoneCheckStatusProps) => (
  <>
    {isChecking && (
      <div className="mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-900 rounded-lg text-sm">
        🔍 Checking inscription type...
      </div>
    )}
    {result && (
      <div className="mb-4 p-3 bg-yellow-200 border border-yellow-700 text-yellow-700 rounded-lg text-sm">
        📊 Detection Result: {result}
      </div>
    )}
  </>
);

