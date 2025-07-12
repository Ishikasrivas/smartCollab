import DashboardOverview from './DashboardOverview'

export default function MainContent({ selectedBoardId }: { selectedBoardId?: number }) {
  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
      {!selectedBoardId ? (
        <DashboardOverview />
      ) : (
        <div className="bg-gray-800 rounded-xl p-8 text-white text-center">
          {/* Placeholder for Kanban board view */}
          <div className="text-2xl font-bold mb-4">Kanban Board (Board ID: {selectedBoardId})</div>
          <div className="text-gray-400">[Kanban board will be rendered here]</div>
        </div>
      )}
    </div>
  )
} 