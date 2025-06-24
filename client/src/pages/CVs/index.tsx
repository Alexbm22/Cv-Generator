import React from "react";
import { useCVsStore } from "../../Store";
import { storeConfig } from "../../Store/config/storeConfig";

const CVsPage: React.FC = () => {

  const addCV = useCVsStore.getState().addCV;

  return (
    <>
      <h1>CVs Page</h1>
      <p>This is the CVs page.</p>
      <button
        onClick={() => {
          addCV(storeConfig.defaultStates.CVObject)
        }}
      >add cv</button>
    </>
  );
}

export default CVsPage;