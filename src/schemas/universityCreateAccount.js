import * as yup from "yup";

const baseUserSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one interger")
    .matches(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "Password must contain at least one special character"
    ),
});

export const teacherSchema = baseUserSchema.shape({
  role: yup.string().oneOf(["teacher"], "Role must be 'teacher'").required(),
  university_id: yup
    .number()
    .typeError("University is required")
    .required("University is required"),
  department: yup.string().required("Department is required"),
});

export const studentSchema = baseUserSchema.shape({
  role: yup.string().oneOf(["student"], "Role must be 'student'").required(),
  university_id: yup
    .number()
    .typeError("University is required")
    .required("University is required"),
  batch_year: yup
    .number()
    .typeError("Batch Year must be a number")
    .required("Batch Year is required")
    .min(1900, "Invalid Batch Year")
    .max(new Date().getFullYear() + 1, "Batch Year cannot be in the future"),
  major: yup.string().required("Major is required"),
  skills: yup.string().nullable(),
  facebook: yup.string().url("Must be a valid URL").nullable(),
  linkedIn: yup.string().url("Must be a valid URL").nullable(),
  student_id_image: yup.string().when("role", {
    is: "student",
    then: (schema) =>
      schema
        .required("Student ID image is required")
        .test("isBase64", "Invalid image format", (value) => {
          const base64Pattern =
            /^data:image\/(jpeg|png|gif|webp|jpg);base64,[A-Za-z0-9+/=]+$/;
          return base64Pattern.test(value);
        }),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
});

export const combinedUniversityAccountSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one interger")
    .matches(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "Password must contain at least one special character"
    ),
  role: yup.string().required("Role is required"),
  university_id: yup
    .number()
    .typeError("University is required")
    .required("University is required"),

  department: yup.string().when("role", {
    is: "teacher",
    then: (schema) => schema.required("Department is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  batch_year: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .when("role", {
      is: "student",
      then: (schema) =>
        schema
          .required("Batch Year is required")
          .min(1900, "Invalid Batch Year")
          .max(
            new Date().getFullYear() + 1,
            "Batch Year cannot be in the future"
          ),
      otherwise: (schema) => schema.notRequired(),
    }),
  major: yup.string().when("role", {
    is: "student",
    then: (schema) => schema.required("Major is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  skills: yup
    .array()
    .of(yup.string())
    .when("role", {
      is: "student",
      then: (schema) =>
        schema.min(1, "Please add at least one skill").required(),
      otherwise: (schema) => schema.notRequired(),
    }),
  student_id_image: yup.string().when("role", {
    is: "student",
    then: (schema) =>
      schema
        .required("Student ID image is required")
        .test("isBase64", "Invalid image format", (value) => {
          const base64Pattern =
            /^data:image\/(jpeg|png|gif|webp|jpg);base64,[A-Za-z0-9+/=]+$/;
          return base64Pattern.test(value);
        }),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),

  facebook: yup.string().when("role", {
    is: "student",
    then: (schema) => schema.url("Must be a valid URL").nullable(),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  linkedIn: yup.string().when("role", {
    is: "student",
    then: (schema) => schema.url("Must be a valid URL").nullable(),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
});
