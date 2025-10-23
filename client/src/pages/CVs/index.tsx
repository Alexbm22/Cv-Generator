import React from "react";
import CreateCVButton from '../../components/features/CV/createCVButton';
import { useCVsStore } from "../../Store";
import CVCard from "./CVCard";

const CVsPage: React.FC = () => {

  const CVs = useCVsStore(state => state.CVState.cvs)

  return (
    <>
      <div className="w-full min-h-screen bg-[#f7fbff] p-4 sm:p-6 lg:p-8">
        <div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6
          gap-5 sm:gap-7 mb-6">
            {CVs.map((cv) => (
              <CVCard key={cv.id} CV={cv}/>
            ))}
          </div>
          
          <div className="flex">
            <CreateCVButton />
          </div>
        </div>
      </div>
    </>
        
  );
}

export default CVsPage;