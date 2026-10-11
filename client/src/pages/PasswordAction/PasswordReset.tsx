import React from "react";
import PasswordActionForm from "./PasswordActionForm";
import { PasswordActionType } from "../../interfaces/passwordAction";

const PasswordReset: React.FC = () => <PasswordActionForm type={PasswordActionType.RESET_PASSWORD} />;

export default PasswordReset;
