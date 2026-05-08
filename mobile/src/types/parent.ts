export interface ParentChild {
  studentId: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
  className: string | null;
  sectionName: string | null;
  active: boolean;
}

export interface MyChildrenResponse {
  children: ParentChild[];
}
