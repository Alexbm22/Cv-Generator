import React from "react";
import CreateCVButton from '../../components/features/CV/createCVButton';
import { useCVsStore } from "../../Store";
import CVCard from "./CVCard";

const CVsPage: React.FC = () => {

  const CVs = useCVsStore(state => state.CVState.cvs)

  return (
    <div className="w-full min-h-screen bg-[#f5f5f7]">
      <div className="max-w-screen-xl mx-auto px-6 py-10 sm:px-10">

        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
              Resumes
            </h1>
            {CVs.length > 0 && (
              <p className="text-sm text-[#6e6e73] mt-0.5">
                {CVs.length} {CVs.length === 1 ? 'document' : 'documents'}
              </p>
            )}
          </div>
          <CreateCVButton />
        </div>

        {/* Cards Grid */}
        {CVs.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
            {CVs.map((cv) => (
              <CVCard key={cv.id} CV={cv} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center select-none">
            
            <p className="text-[15px] font-semibold text-[#1d1d1f] mb-1">No resumes yet</p>
            <p className="text-[13px] text-[#6e6e73] mb-6">Create your first resume to get started.</p>
            <CreateCVButton />
          </div>
        )}
      </div>
    </div>
  );
}

export default CVsPage;