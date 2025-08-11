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
  website: yup.string().url("Must be a valid URL").nullable(),
});

export const companySchema = baseUserSchema.shape({
  role: yup.string().oneOf(["company"], "Role must be 'company'").required(),
  location: yup.string().required("Location is required"),
  contact_info: yup.string().required("Contact Info is required"),
  description: yup.string().required("Description is required"),
  facebook: yup.string().url("Must be a valid URL").nullable(),
  address: yup.string().notRequired(),
});

export const universitySchema = baseUserSchema.shape({
  role: yup
    .string()
    .oneOf(["university"], "Role must be 'university'")
    .required(),
  address: yup.string().required("Address is required"),
  location: yup.string().notRequired().nullable(),
  contact_info: yup.string().required("Contact Info is required"),
  description: yup.string().notRequired(),
  facebook: yup.string().url("Must be a valid URL").nullable(),
});

export const combinedAccountSchema = yup.object().shape({
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
  address: yup.string().when("role", {
    is: (val) => val === "university",
    then: (schema) => schema.required("Address is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  location: yup.string().when("role", {
    is: (val) => val === "company",
    then: (schema) => schema.required("Location is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  contact_info: yup.string().when("role", {
    is: (val) => val === "company" || val === "university",
    then: (schema) => schema.required("Contact Info is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  website: yup.string().url("Must be a valid URL").nullable(),

  facebook: yup.string().when("role", {
    is: (val) => val === "company",
    then: (schema) => schema.url("Must be a valid URL").nullable(),
    otherwise: (schema) => schema.url("Must be a valid URL").nullable(),
  }),
  description: yup.string().when("role", {
    is: (val) => val === "company",
    then: (schema) => schema.required("Description is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
});
