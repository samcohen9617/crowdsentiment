import { Eye } from "lucide-react";

export function AppHeader() {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Eye className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Computer Vision Detection</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">Powered by Roboflow API</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" title="API Status: Connected"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
