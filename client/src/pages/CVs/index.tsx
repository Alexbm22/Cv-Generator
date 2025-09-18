import React from "react";
import CreateCVButton from '../../components/features/CV/createCVButton';
import { useCVsStore } from "../../Store";
import CVCard from "./CVCard";

const CVsPage: React.FC = () => {

  const CVs = useCVsStore(state => state.CVState.cvs)

  return (
    <>
      <h1>CVs Page</h1>
      <div className="flex flex-row">
        {
          CVs.map((cv) => (
            <div key={cv.id}>
              <CVCard CV={cv}/>
            </div>
          ))
        }
      </div>
      <CreateCVButton />
    </>
  );
}

export default CVsPage;