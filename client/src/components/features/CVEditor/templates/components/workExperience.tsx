import React from "react";
import { useCvStore } from "../../../../../Store";

interface ComponentProps {
    componentClassName: string
}

const WorkExperience: React.FC<ComponentProps> = ({
    componentClassName
}) => {

    const { workExperience } = useCvStore();

    return (
        <div className={componentClassName}>
            {
                workExperience.map((work, index) => {

                    return (
                        <div key={index} className="relative p-4">
                            <div className="absolute flex justify-center content-center h-full w-1 bg-black">
                                <div className="relative flex justify-center content-center">
                                    <div className="absolute h-2 w-2 rounded-full bg-black"></div>
                                </div>
                            </div>
                            <div className="ml-5">
                                <div className="">January 2025</div>
                            </div>
                        </div>
                        
                    )
                })
            }
        </div>
    )
}

export default WorkExperience;