import React from "react";
import PasswordActionForm from "./PasswordActionForm";
import { PasswordActionType } from "../../interfaces/passwordAction";

const PasswordChange: React.FC = () => <PasswordActionForm type={PasswordActionType.CHANGE_PASSWORD} />;

export default PasswordChange;
