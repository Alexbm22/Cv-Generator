import React from "react";
import { useCreateCV } from "../../hooks/useCVs";
import { useCVsStore } from "../../Store";
import { useNavigate } from "react-router-dom";
import { routes } from "../../router/routes";

const CVsPage: React.FC = () => {

  const { mutate: createNewCV } = useCreateCV();
  const CVs = useCVsStore(state => state.CVs);
  const navigate = useNavigate();

  return (
    <>
      <h1>CVs Page</h1>
      <p>This is the CVs page.</p>
      <button
        onClick={() => {
          createNewCV()
        }}
      >add cv</button>
      <div>
        {
          CVs.map((cv) => (
            <div key={cv.id}>
              {cv.id}
              <button onClick={() => {
                navigate(routes.editResume.path.replace(/:id$/, cv.id), {
                  replace: true
                })
              }}>
                edit
              </button>
            </div>
          ))
        }
      </div>
    </>
  );
}

export default CVsPage;