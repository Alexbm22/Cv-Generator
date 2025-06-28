import React from "react";
import { useCreateCV } from "../../hooks/useCVs";

const CVsPage: React.FC = () => {

  const { mutate: createNewCV } = useCreateCV();
  

  return (
    <>
      <h1>CVs Page</h1>
      <p>This is the CVs page.</p>
      <button
        onClick={() => {
          createNewCV()
        }}
      >add cv</button>
    </>
  );
}

export default CVsPage;