-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('REGISTRAR', 'STUDENT');

-- CreateEnum
CREATE TYPE "curriculum_type" AS ENUM ('MANDATORY', 'PROFILE_ELECTIVE');

-- CreateEnum
CREATE TYPE "enrollment_status" AS ENUM ('ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "record_status" AS ENUM ('PASSED', 'FAILED');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "registration_number" VARCHAR(20) NOT NULL,

    CONSTRAINT "student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "mandatory_hours" INTEGER NOT NULL,
    "profile_elective_hours" INTEGER NOT NULL,
    "free_elective_hours" INTEGER NOT NULL,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_subject" (
    "course_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "type" "curriculum_type" NOT NULL,

    CONSTRAINT "curriculum_subject_pkey" PRIMARY KEY ("course_id","subject_id")
);

-- CreateTable
CREATE TABLE "subject" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "workload_hours" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prerequisite" (
    "subject_id" INTEGER NOT NULL,
    "prerequisite_id" INTEGER NOT NULL,

    CONSTRAINT "prerequisite_pkey" PRIMARY KEY ("subject_id","prerequisite_id")
);

-- CreateTable
CREATE TABLE "professor" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(5) NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "professor_id" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "section_id" INTEGER NOT NULL,
    "status" "enrollment_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMPTZ,

    CONSTRAINT "enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_record" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "term" VARCHAR(6) NOT NULL,
    "status" "record_status" NOT NULL,

    CONSTRAINT "academic_record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_user_id_key" ON "student"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_registration_number_key" ON "student"("registration_number");

-- CreateIndex
CREATE INDEX "student_course_id_idx" ON "student"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_code_key" ON "course"("code");

-- CreateIndex
CREATE INDEX "curriculum_subject_subject_id_idx" ON "curriculum_subject"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_code_key" ON "subject"("code");

-- CreateIndex
CREATE INDEX "prerequisite_prerequisite_id_idx" ON "prerequisite"("prerequisite_id");

-- CreateIndex
CREATE UNIQUE INDEX "professor_email_key" ON "professor"("email");

-- CreateIndex
CREATE INDEX "section_professor_id_idx" ON "section"("professor_id");

-- CreateIndex
CREATE UNIQUE INDEX "section_subject_id_code_key" ON "section"("subject_id", "code");

-- CreateIndex
CREATE INDEX "enrollment_section_id_status_idx" ON "enrollment"("section_id", "status");

-- CreateIndex
CREATE INDEX "enrollment_student_id_status_idx" ON "enrollment"("student_id", "status");

-- CreateIndex
CREATE INDEX "academic_record_subject_id_idx" ON "academic_record"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_record_student_id_subject_id_term_key" ON "academic_record"("student_id", "subject_id", "term");

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_subject" ADD CONSTRAINT "curriculum_subject_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_subject" ADD CONSTRAINT "curriculum_subject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisite" ADD CONSTRAINT "prerequisite_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisite" ADD CONSTRAINT "prerequisite_prerequisite_id_fkey" FOREIGN KEY ("prerequisite_id") REFERENCES "subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_record" ADD CONSTRAINT "academic_record_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_record" ADD CONSTRAINT "academic_record_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "subject" ADD CONSTRAINT "subject_workload_hours_check" CHECK ("workload_hours" BETWEEN 15 AND 120 AND "workload_hours" % 15 = 0);
ALTER TABLE "section" ADD CONSTRAINT "section_capacity_check" CHECK ("capacity" >= 1);
ALTER TABLE "prerequisite" ADD CONSTRAINT "prerequisite_not_self_check" CHECK ("subject_id" <> "prerequisite_id");
ALTER TABLE "course" ADD CONSTRAINT "course_hours_check" CHECK ("mandatory_hours" >= 0 AND "profile_elective_hours" >= 0 AND "free_elective_hours" >= 0);
