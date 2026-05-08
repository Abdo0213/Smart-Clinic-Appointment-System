-- Clinic System Seed Data (Expanded)
-- This script populates the shared clinic_db with consistent data across all microservices.
-- Password123! this is the password for all users
-- 1. AUTH ROLES
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp") VALUES
('1', 'Admin', 'ADMIN', 'admin-stamp'),
('2', 'Doctor', 'DOCTOR', 'doctor-stamp'),
('3', 'Patient', 'PATIENT', 'patient-stamp'),
('4', 'Receptionist', 'RECEPTIONIST', 'receptionist-stamp')
ON CONFLICT DO NOTHING;

-- 2. USERS (Password is 'Password123!' for all)
INSERT INTO "AspNetUsers" ("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount", "FirstName", "LastName") VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@clinic.com', 'ADMIN@CLINIC.COM', 'admin@clinic.com', 'ADMIN@CLINIC.COM', TRUE, 'AQAAAAEAACcQAAAAEK5eXrEpOH3CQkI3OjGAdjQ1RHkcXHec9xdwMnid8n7w8jhSfUSA9JEpq+dY6uxfQA==', 'STAMP1', 'CONC1', TRUE, FALSE, TRUE, 0, 'System', 'Admin'),
('a1111111-1111-1111-1111-111111111111', 'house@clinic.com', 'HOUSE@CLINIC.COM', 'house@clinic.com', 'HOUSE@CLINIC.COM', TRUE, 'AQAAAAEAACcQAAAAEK5eXrEpOH3CQkI3OjGAdjQ1RHkcXHec9xdwMnid8n7w8jhSfUSA9JEpq+dY6uxfQA==', 'STAMP2', 'CONC2', TRUE, FALSE, TRUE, 0, 'Gregory', 'House'),
('a2222222-2222-2222-2222-222222222222', 'watson@clinic.com', 'WATSON@CLINIC.COM', 'watson@clinic.com', 'WATSON@CLINIC.COM', TRUE, 'AQAAAAEAACcQAAAAEK5eXrEpOH3CQkI3OjGAdjQ1RHkcXHec9xdwMnid8n7w8jhSfUSA9JEpq+dY6uxfQA==', 'STAMP3', 'CONC3', TRUE, FALSE, TRUE, 0, 'John', 'Watson'),
('a5555555-5555-5555-5555-555555555555', 'grey@clinic.com', 'GREY@CLINIC.COM', 'grey@clinic.com', 'GREY@CLINIC.COM', TRUE, 'AQAAAAEAACcQAAAAEK5eXrEpOH3CQkI3OjGAdjQ1RHkcXHec9xdwMnid8n7w8jhSfUSA9JEpq+dY6uxfQA==', 'STAMP5', 'CONC5', TRUE, FALSE, TRUE, 0, 'Meredith', 'Grey'),
('a6666666-6666-6666-6666-666666666666', 'murphy@clinic.com', 'MURPHY@CLINIC.COM', 'murphy@clinic.com', 'MURPHY@CLINIC.COM', TRUE, 'AQAAAAEAACcQAAAAEK5eXrEpOH3CQkI3OjGAdjQ1RHkcXHec9xdwMnid8n7w8jhSfUSA9JEpq+dY6uxfQA==', 'STAMP6', 'CONC6', TRUE, FALSE, TRUE, 0, 'Shaun', 'Murphy'),
('a3333333-3333-3333-3333-333333333333', 'alice@gmail.com', 'ALICE@GMAIL.COM', 'alice@gmail.com', 'ALICE@GMAIL.COM', TRUE, 'AQAAAAEAACcQAAAAEK5eXrEpOH3CQkI3OjGAdjQ1RHkcXHec9xdwMnid8n7w8jhSfUSA9JEpq+dY6uxfQA==', 'STAMP4', 'CONC4', TRUE, FALSE, TRUE, 0, 'Alice', 'Smith'),
('a4444444-4444-4444-4444-444444444444', 'bob@gmail.com', 'BOB@GMAIL.COM', 'bob@gmail.com', 'BOB@GMAIL.COM', TRUE, 'AQAAAAEAACcQAAAAEK5eXrEpOH3CQkI3OjGAdjQ1RHkcXHec9xdwMnid8n7w8jhSfUSA9JEpq+dY6uxfQA==', 'STAMP7', 'CONC7', TRUE, FALSE, TRUE, 0, 'Bob', 'Johnson'),
('a7777777-7777-7777-7777-777777777777', 'charlie@gmail.com', 'CHARLIE@GMAIL.COM', 'charlie@gmail.com', 'CHARLIE@GMAIL.COM', TRUE, 'AQAAAAEAACcQAAAAEK5eXrEpOH3CQkI3OjGAdjQ1RHkcXHec9xdwMnid8n7w8jhSfUSA9JEpq+dY6uxfQA==', 'STAMP8', 'CONC8', TRUE, FALSE, TRUE, 0, 'Charlie', 'Brown'),
('a8888888-8888-8888-8888-888888888888', 'diana@gmail.com', 'DIANA@GMAIL.COM', 'diana@gmail.com', 'DIANA@GMAIL.COM', TRUE, 'AQAAAAEAACcQAAAAEK5eXrEpOH3CQkI3OjGAdjQ1RHkcXHec9xdwMnid8n7w8jhSfUSA9JEpq+dY6uxfQA==', 'STAMP9', 'CONC9', TRUE, FALSE, TRUE, 0, 'Diana', 'Prince')
ON CONFLICT DO NOTHING;

INSERT INTO "AspNetUserRoles" ("UserId", "RoleId") VALUES
('a0000000-0000-0000-0000-000000000001', '1'),
('a1111111-1111-1111-1111-111111111111', '2'),
('a2222222-2222-2222-2222-222222222222', '2'),
('a5555555-5555-5555-5555-555555555555', '2'),
('a6666666-6666-6666-6666-666666666666', '2'),
('a3333333-3333-3333-3333-333333333333', '3'),
('a4444444-4444-4444-4444-444444444444', '3'),
('a7777777-7777-7777-7777-777777777777', '3'),
('a8888888-8888-8888-8888-888888888888', '3')
ON CONFLICT DO NOTHING;

-- 3. DOCTORS
INSERT INTO doctors (id, user_id, first_name, last_name, specialization, bio, phone, is_active, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Gregory', 'House', 'Diagnostics', 'Everybody lies.', '555-0101', TRUE, NOW()),
('22222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'John', 'Watson', 'General Practice', 'Former army doctor.', '555-0102', TRUE, NOW()),
('55555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'Meredith', 'Grey', 'Surgery', 'It is a beautiful day to save lives.', '555-0103', TRUE, NOW()),
('66666666-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', 'Shaun', 'Murphy', 'Surgery', 'I am a surgeon.', '555-0104', TRUE, NOW())
ON CONFLICT DO NOTHING;

-- 4. PATIENTS
INSERT INTO patients (id, user_id, first_name, last_name, date_of_birth, gender, phone, address, created_at) VALUES
('33333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Alice', 'Smith', '1990-05-15', 'FEMALE', '555-0201', '123 Maple St', NOW()),
('44444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'Bob', 'Johnson', '1985-11-22', 'MALE', '555-0202', '456 Oak Ave', NOW()),
('77777777-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', 'Charlie', 'Brown', '2010-10-10', 'MALE', '555-0203', '789 Pine Rd', NOW()),
('88888888-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', 'Diana', 'Prince', '1984-01-01', 'FEMALE', '555-0204', '999 Paradise Island', NOW())
ON CONFLICT DO NOTHING;

-- 5. BULK DATA GENERATION (50 Appointments, Visits, and Invoices)
DO $$
DECLARE
    patients UUID[] := ARRAY[
        '33333333-3333-3333-3333-333333333333', 
        '44444444-4444-4444-4444-444444444444',
        '77777777-7777-7777-7777-777777777777',
        '88888888-8888-8888-8888-888888888888'
    ];
    doctors UUID[] := ARRAY[
        '11111111-1111-1111-1111-111111111111', 
        '22222222-2222-2222-2222-222222222222',
        '55555555-5555-5555-5555-555555555555',
        '66666666-6666-6666-6666-666666666666'
    ];
    app_id UUID;
    visit_id UUID;
    inv_id UUID;
    p_id UUID;
    d_id UUID;
    i INTEGER;
    current_dt DATE;
    status TEXT;
BEGIN
    FOR i IN 1..50 LOOP
        -- Distribute dates: spread across last 40 days and next 10 days
        current_dt := CURRENT_DATE + (i - 40); 
        
        -- Pick doctor and patient in rotation
        p_id := patients[(i % 4) + 1];
        d_id := doctors[(i % 4) + 1];

        -- Generate unique but deterministic UUIDs based on index
        app_id := CAST(md5('app' || i::text) AS UUID);
        visit_id := CAST(md5('visit' || i::text) AS UUID);
        inv_id := CAST(md5('inv' || i::text) AS UUID);
        
        -- Determine status
        status := CASE 
            WHEN i % 5 = 0 THEN 'CANCELLED'
            WHEN i % 4 = 0 THEN 'COMPLETED'
            WHEN i % 3 = 0 THEN 'CONFIRMED'
            ELSE 'REQUESTED'
        END;

        -- Insert Appointment
        INSERT INTO appointments (id, patient_id, doctor_id, slot_date, slot_start, slot_end, status, booked_by, price, created_at)
        VALUES (
            app_id, 
            p_id,
            d_id,
            current_dt,
            '09:00:00', '09:30:00',
            status,
            'a0000000-0000-0000-0000-000000000001',
            100.00 + (i * 2),
            NOW()
        ) ON CONFLICT DO NOTHING;
        
        -- If completed, add visit and invoice
        IF status = 'COMPLETED' THEN
            -- Insert Visit
            INSERT INTO visits (id, appointment_id, patient_id, doctor_id, chief_complaint, examination_findings, assessment, plan, is_signed, created_at)
            VALUES (
                visit_id, app_id, 
                p_id,
                d_id,
                'Routine follow-up session ' || i, 
                'Stable vital signs. Patient responding well to treatment.', 
                'General health is improving.', 
                'Maintain current prescription. Follow up as scheduled.', 
                TRUE, 
                NOW()
            ) ON CONFLICT DO NOTHING;
            
            -- Insert Invoice
            INSERT INTO invoices (id, visit_id, patient_id, status, total_amount, created_at)
            VALUES (
                inv_id, visit_id,
                p_id,
                CASE WHEN i % 5 = 0 THEN 'PENDING' ELSE 'PAID' END,
                100.00 + (i * 2), 
                NOW()
            ) ON CONFLICT DO NOTHING;
            
            -- Insert Line Item
            INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, total_price)
            VALUES (
                CAST(md5('line' || i::text) AS UUID), 
                inv_id, 
                'Consultation Fee', 
                1, 
                100.00 + (i * 2), 
                100.00 + (i * 2)
            ) ON CONFLICT DO NOTHING;

            -- Add a dummy prescription for some visits
            IF i % 3 = 0 THEN
                INSERT INTO prescriptions (id, visit_id, patient_id, medication_name, dosage, frequency, duration_days, notes, issued_at)
                VALUES (
                    CAST(md5('rx' || i::text) AS UUID),
                    visit_id,
                    p_id,
                    CASE WHEN i % 2 = 0 THEN 'Metformin' ELSE 'Lisinopril' END,
                    '500mg',
                    'Once daily',
                    30,
                    'Take after breakfast.',
                    NOW()
                ) ON CONFLICT DO NOTHING;
            END IF;
        END IF;
    END LOOP;
END $$;
