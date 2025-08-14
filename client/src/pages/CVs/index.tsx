import React from "react";
import { useCreateCV } from "../../hooks/CVs/useCVs";
import { useCVsStore } from "../../Store";
import CVCard from "./CVCard";

const CVsPage: React.FC = () => {

  const { mutate: createNewCV } = useCreateCV();
  const CVs = useCVsStore(state => state.CVs)

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
      <button
        onClick={() => {
          createNewCV()
        }}
      >add cv</button>
    </>
  );
}

export default CVsPage;