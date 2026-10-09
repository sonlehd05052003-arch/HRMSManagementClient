import authSlide from "./authSlide";
import roleSlide from "./roleSlide";
import userSlide from "./userSlide";

import taskSlide from "./taskSlide";
import employeeSlide from "./employeeSlide";
import employeeDocumentSlide from "./employeeDocumentSlide";
import departmentSlide from "./departmentSlide";
import positionSlide from "./positionSlide";
import attendanceSlide from "./attendanceSlide";
import hrProcedureSlide from "./hrProcedureSlide";
import shiftSlide from "./shiftSlide";
import shiftAssignmentSlide from "./shiftAssignmentSlide";
import leaveRequestSlide from "./leaveRequestSlide";
import leaveTypeSlide from "./leaveTypeSlide";
import leaveBalanceSlide from "./leaveBalanceSlide";
import overtimeSlide from "./overtimeSlide";
import exportSlide from "./exportSlide";
import systemSettingSlide from "./systemSettingSlide";
import faceSlide from "./faceSlide";
import dashboardSlide from "./dashboardSlide";
import payrollSlide from "./payrollSlide";
import resignationRequestSlide from "./resignationRequestSlide";
import menuSlide from "./menuSlide";
import companySlide from "./companySlide";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

const reducers = {
  // Not persisted: the session lives in an HttpOnly cookie and is re-read from the API on load
  auth: authSlide,
  role: roleSlide,
  user: userSlide,
  task: taskSlide,
  employee: employeeSlide,
  employeeDocument: employeeDocumentSlide,
  department: departmentSlide,
  position: positionSlide,
  attendance: attendanceSlide,
  hrProcedure: hrProcedureSlide,
  shift: shiftSlide,
  shiftAssignment: shiftAssignmentSlide,
  leaveRequest: leaveRequestSlide,
  leaveType: leaveTypeSlide,
  leaveBalance: leaveBalanceSlide,
  overtime: overtimeSlide,
  export: exportSlide,
  systemSetting: systemSettingSlide,
  face: faceSlide,
  dashboard: dashboardSlide,
  payroll: payrollSlide,
  resignationRequest: resignationRequestSlide,
  menu: menuSlide,
  company: companySlide,
}
const rootReducer = combineReducers(reducers);
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;