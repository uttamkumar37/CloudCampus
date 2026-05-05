#!/usr/bin/env python3
"""
CloudCampus demo data seeder (single-school profile).

Creates one tenant and a compact, realistic dataset:
- 1 school admin
- 1 teacher user + teacher record
- 1 student user + student record
- 1 parent user and parent-student link
- classes, section, subject, timetable, homework, exam, attendance, fees

Idempotent behavior: the script skips resources that already exist when possible.
"""

from __future__ import annotations

import json
import sys
from datetime import date, timedelta
from typing import Any

import requests

BASE_URL = "http://localhost:8080/api/v1"
TIMEOUT = 25

SUPER_ADMIN = {
    "username": "superadmin",
    "password": "SuperAdmin_Docker_2026!",
}

TENANT = {
    "tenantId": "cloudcampus-demo-school",
    "slug": "cloudcampus-demo-school",
    "schoolName": "CloudCampus Demo School",
    "schemaName": "school_cloudcampus_demo_school",
    "primaryColor": "#0f766e",
    "logoUrl": "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=300&q=80",
}

USERS = {
    "schoolAdmin": {
        "fullName": "Ananya Principal",
        "username": "ananya.principal",
        "email": "ananya.principal@cloudcampus.demo",
        "password": "Admin@Demo2026!",
        "role": "SCHOOL_ADMIN",
    },
    "teacher": {
        "fullName": "Rohit Verma",
        "username": "rohit.verma",
        "email": "rohit.verma@cloudcampus.demo",
        "password": "Teacher@Demo2026!",
        "role": "TEACHER",
    },
    "student": {
        "fullName": "Mira Patel",
        "username": "mira.patel",
        "email": "mira.patel@cloudcampus.demo",
        "password": "Student@Demo2026!",
        "role": "STUDENT",
    },
    "parent": {
        "fullName": "Sanjay Patel",
        "username": "sanjay.patel",
        "email": "sanjay.patel@cloudcampus.demo",
        "password": "Parent@Demo2026!",
        "role": "PARENT",
    },
}


class ApiClient:
    def __init__(self, token: str | None = None, tenant_schema: str | None = None):
        self.token = token
        self.tenant_schema = tenant_schema

    def request(self, method: str, path: str, json_body: dict[str, Any] | None = None) -> dict[str, Any]:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        if self.tenant_schema:
            headers["X-Tenant-ID"] = self.tenant_schema

        response = requests.request(
            method,
            f"{BASE_URL}{path}",
            headers=headers,
            json=json_body,
            timeout=TIMEOUT,
        )
        try:
            return response.json()
        except Exception:
            return {"success": False, "message": response.text}


def is_success(payload: dict[str, Any]) -> bool:
    return bool(payload.get("success"))


def login(username: str, password: str, tenant_slug: str | None = None) -> dict[str, Any]:
    body: dict[str, Any] = {"username": username, "password": password}
    if tenant_slug:
        body["tenantSlug"] = tenant_slug

    response = requests.post(
        f"{BASE_URL}/auth/login",
        headers={"Content-Type": "application/json"},
        json=body,
        timeout=TIMEOUT,
    )
    response.raise_for_status()
    payload = response.json()
    if not payload.get("success"):
        raise RuntimeError(payload.get("message", "Login failed"))
    return payload["data"]


def print_step(text: str) -> None:
    print(f"\n==> {text}")


def create_or_get_tenant(admin_client: ApiClient) -> dict[str, Any]:
    create_payload = {
        "tenantId": TENANT["tenantId"],
        "slug": TENANT["slug"],
        "schoolName": TENANT["schoolName"],
        "schemaName": TENANT["schemaName"],
        "primaryColor": TENANT["primaryColor"],
        "logoUrl": TENANT["logoUrl"],
    }
    created = admin_client.request("POST", "/tenants", create_payload)
    if is_success(created):
        return created["data"]

    existing = admin_client.request("GET", f"/tenants/{TENANT['tenantId']}")
    if is_success(existing):
        return existing["data"]

    raise RuntimeError(f"Unable to create/fetch tenant: {created}")


def ensure_plan_subscription(admin_client: ApiClient) -> None:
    plans_payload = admin_client.request("GET", "/plans")
    plans = plans_payload.get("data") or []
    plan = next((p for p in plans if p.get("name") == "BASIC"), None) or next((p for p in plans if p.get("name") == "FREE"), None)
    if not plan:
        raise RuntimeError("No BASIC/FREE plan found")

    subscribe = admin_client.request(
        "POST",
        f"/tenants/{TENANT['tenantId']}/subscribe",
        {"planId": plan["id"], "durationDays": 365},
    )
    if not is_success(subscribe):
        msg = str(subscribe.get("message", ""))
        if "already" not in msg.lower() and "active" not in msg.lower():
            raise RuntimeError(f"Subscribe failed: {subscribe}")


def ensure_user(client: ApiClient, payload: dict[str, Any]) -> dict[str, Any] | None:
    result = client.request("POST", "/users", payload)
    if is_success(result):
        return result["data"]
    msg = str(result.get("message", "")).lower()
    if "already exists" in msg or "duplicate" in msg:
        return None
    raise RuntimeError(f"User create failed for {payload['username']}: {result}")


def main() -> int:
    print_step("Super admin login")
    super_admin_login = login(SUPER_ADMIN["username"], SUPER_ADMIN["password"])
    super_admin_client = ApiClient(token=super_admin_login["accessToken"])

    print_step("Create or fetch tenant")
    tenant_info = create_or_get_tenant(super_admin_client)
    tenant_schema = tenant_info["schemaName"]
    print(f"Tenant schema: {tenant_schema}")

    print_step("Ensure tenant subscription")
    ensure_plan_subscription(super_admin_client)

    print_step("Create school admin user")
    tenant_client = ApiClient(token=super_admin_login["accessToken"], tenant_schema=tenant_schema)
    ensure_user(tenant_client, USERS["schoolAdmin"])

    print_step("Login as school admin")
    school_admin_login = login(USERS["schoolAdmin"]["username"], USERS["schoolAdmin"]["password"], TENANT["slug"])
    school_admin_client = ApiClient(token=school_admin_login["accessToken"], tenant_schema=tenant_schema)

    print_step("Create role users for login testing")
    teacher_user = ensure_user(school_admin_client, USERS["teacher"])
    student_user = ensure_user(school_admin_client, USERS["student"])
    parent_user = ensure_user(school_admin_client, USERS["parent"])

    print_step("Create academic structure")
    class_resp = school_admin_client.request("POST", "/academics/classes", {"name": "Grade 7", "code": "G7"})
    if not is_success(class_resp):
        classes = school_admin_client.request("GET", "/academics/classes")
        class_data = next((c for c in (classes.get("data") or []) if c.get("code") == "G7"), None)
    else:
        class_data = class_resp["data"]

    if not class_data:
        raise RuntimeError("Could not resolve class G7")

    section_resp = school_admin_client.request("POST", "/academics/sections", {"name": "A", "classId": class_data["id"]})
    if not is_success(section_resp):
        sections = school_admin_client.request("GET", "/academics/sections")
        section_data = next((s for s in (sections.get("data") or []) if s.get("name") == "A" and s.get("classId") == class_data["id"]), None)
    else:
        section_data = section_resp["data"]

    subject_resp = school_admin_client.request("POST", "/academics/subjects", {"name": "Mathematics", "code": "MATH7"})
    if not is_success(subject_resp):
        subjects = school_admin_client.request("GET", "/academics/subjects")
        subject_data = next((s for s in (subjects.get("data") or []) if s.get("code") == "MATH7"), None)
    else:
        subject_data = subject_resp["data"]

    if not section_data or not subject_data:
        raise RuntimeError("Could not resolve section/subject")

    print_step("Create teacher and student records")
    school_admin_client.request(
        "POST",
        "/teachers",
        {
            "employeeNo": "T-7001",
            "firstName": "Rohit",
            "lastName": "Verma",
            "email": "rohit.teacher.record@cloudcampus.demo",
            "phone": "+919000000701",
            "hireDate": str(date.today() - timedelta(days=700)),
        },
    )

    student_record = school_admin_client.request(
        "POST",
        "/students",
        {
            "admissionNo": "ADM-7001",
            "firstName": "Mira",
            "lastName": "Patel",
            "dateOfBirth": "2012-08-14",
            "gender": "FEMALE",
            "email": "mira.student.record@cloudcampus.demo",
            "phone": "+919000000702",
        },
    )

    if not is_success(student_record):
        students_payload = school_admin_client.request("GET", "/students?page=0&size=20")
        student_rows = (students_payload.get("data") or {}).get("content") or []
        student_data = next((s for s in student_rows if s.get("admissionNo") == "ADM-7001"), None)
    else:
        student_data = student_record["data"]

    if not student_data:
        raise RuntimeError("Could not resolve student ADM-7001")

    print_step("Link parent to student")
    if parent_user and parent_user.get("id"):
        school_admin_client.request(
            "POST",
            "/parents/links",
            {"parentUserId": parent_user["id"], "studentId": student_data["id"]},
        )

    print_step("Create timetable, homework, exam, attendance and fee")
    school_admin_client.request(
        "POST",
        "/timetable/slots",
        {
            "classId": class_data["id"],
            "sectionId": section_data["id"],
            "subjectId": subject_data["id"],
            "teacherId": None,
            "dayOfWeek": 1,
            "startTime": "09:00",
            "endTime": "09:45",
            "label": "Math Period",
        },
    )

    school_admin_client.request(
        "POST",
        "/homework",
        {
            "title": "Fractions Worksheet",
            "instructions": "Complete exercises 1-10",
            "classId": class_data["id"],
            "sectionId": section_data["id"],
            "dueDate": str(date.today() + timedelta(days=3)),
        },
    )

    exam_payload = school_admin_client.request(
        "POST",
        "/exams",
        {
            "title": "Math Unit Test",
            "examDate": str(date.today() + timedelta(days=10)),
            "classId": class_data["id"],
            "sectionId": section_data["id"],
            "subjectId": subject_data["id"],
            "maxMarks": 100,
        },
    )

    if is_success(exam_payload):
        school_admin_client.request(
            "POST",
            "/exams/results",
            {
                "examId": exam_payload["data"]["id"],
                "studentId": student_data["id"],
                "marksObtained": 86,
                "remarks": "Strong performance",
            },
        )

    school_admin_client.request(
        "POST",
        "/attendances",
        {
            "studentId": student_data["id"],
            "classId": class_data["id"],
            "sectionId": section_data["id"],
            "attendanceDate": str(date.today()),
            "status": "PRESENT",
        },
    )

    fee_payload = school_admin_client.request(
        "POST",
        "/fees/assignments",
        {
            "studentId": student_data["id"],
            "feeTitle": "Term 1 Tuition",
            "amount": 25000,
            "dueDate": str(date.today() + timedelta(days=20)),
        },
    )

    if is_success(fee_payload):
        school_admin_client.request(
            "POST",
            "/fees/payments",
            {
                "feeAssignmentId": fee_payload["data"]["id"],
                "amountPaid": 10000,
                "paymentDate": str(date.today()),
                "paymentMethod": "UPI",
                "referenceNo": "DEMO-UPI-1001",
            },
        )

    print("\nDemo data seed completed successfully.")
    print("\nLogin credentials:")
    print(json.dumps({
        "tenantSlug": TENANT["slug"],
        "tenantSchema": tenant_schema,
        "superAdmin": SUPER_ADMIN,
        "schoolAdmin": {"username": USERS["schoolAdmin"]["username"], "password": USERS["schoolAdmin"]["password"]},
        "teacher": {"username": USERS["teacher"]["username"], "password": USERS["teacher"]["password"]},
        "student": {"username": USERS["student"]["username"], "password": USERS["student"]["password"]},
        "parent": {"username": USERS["parent"]["username"], "password": USERS["parent"]["password"]},
    }, indent=2))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"\nSeed failed: {exc}")
        sys.exit(1)
