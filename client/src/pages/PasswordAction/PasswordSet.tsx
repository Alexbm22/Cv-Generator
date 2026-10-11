import React from "react";
import PasswordActionForm from "./PasswordActionForm";
import { PasswordActionType } from "../../interfaces/passwordAction";

const PasswordSet: React.FC = () => <PasswordActionForm type={PasswordActionType.SET_PASSWORD} />;

export default PasswordSet;
