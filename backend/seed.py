import sys
import os
from datetime import datetime, timedelta, timezone

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.customer import Customer
from app.models.employee import Employee
from app.models.service import Service
from app.models.service_request import ServiceRequest
from app.models.appointment import Appointment
from app.core.security import get_password_hash

def seed_data():
    print("Re-creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        if db.query(User).first():
            print("Database already contains data. Skipping seed.")
            return

        print("Seeding Users and Employees...")
        admin_user = User(
            name="Sarah Jenkins",
            email="admin@servicehub.com",
            password_hash=get_password_hash("admin123"),
            role="ADMIN"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        admin_employee = Employee(
            user_id=admin_user.id,
            employee_code="EMP-0001",
            department="Executive Management",
            position="Operations Director"
        )
        db.add(admin_employee)

        emp_user_1 = User(
            name="David Miller",
            email="tech@servicehub.com",
            password_hash=get_password_hash("employee123"),
            role="EMPLOYEE"
        )
        db.add(emp_user_1)
        db.commit()
        db.refresh(emp_user_1)

        emp_1 = Employee(
            user_id=emp_user_1.id,
            employee_code="EMP-0002",
            department="Engineering & IT",
            position="Lead Developer"
        )
        db.add(emp_1)

        emp_user_2 = User(
            name="Elena Rostova",
            email="designer@servicehub.com",
            password_hash=get_password_hash("employee123"),
            role="EMPLOYEE"
        )
        db.add(emp_user_2)
        db.commit()
        db.refresh(emp_user_2)

        emp_2 = Employee(
            user_id=emp_user_2.id,
            employee_code="EMP-0003",
            department="Creative Design",
            position="Senior UI/UX Specialist"
        )
        db.add(emp_2)
        db.commit()

        print("Seeding Customers...")
        customer_list = [
            Customer(name="Apex Solutions Inc.", email="contact@apexsolutions.com", phone="+1-555-0101", address="100 Tech Plaza, Austin TX"),
            Customer(name="BioHealth Diagnostics", email="support@biohealth.org", phone="+1-555-0102", address="450 Science Park, Boston MA"),
            Customer(name="Acme Global Logistics", email="ops@acmeglobal.com", phone="+1-555-0103", address="88 Harbor Rd, Seattle WA"),
            Customer(name="Horizon Digital Media", email="info@horizonmedia.io", phone="+1-555-0104", address="12 Madison Ave, New York NY"),
            Customer(name="NextGen Retail Group", email="hello@nextgenretail.com", phone="+1-555-0105", address="77 Market St, San Francisco CA"),
            Customer(name="Vanguard Security", email="admin@vanguardsec.com", phone="+1-555-0106", address="500 Tower Way, Chicago IL"),
            Customer(name="Summit Financial Partners", email="contact@summitfin.com", phone="+1-555-0107", address="200 Wall St, New York NY"),
            Customer(name="Quantum Dynamics", email="research@quantumdyn.io", phone="+1-555-0108", address="15 Innovation Blvd, Denver CO"),
            Customer(name="Pulse Creative Agency", email="projects@pulsecreative.com", phone="+1-555-0109", address="33 Art District, Los Angeles CA"),
            Customer(name="Stellar Software House", email="team@stellarsoft.dev", phone="+1-555-0110", address="90 Silicon Way, San Jose CA"),
        ]
        db.add_all(customer_list)
        db.commit()

        print("Seeding Services...")
        service_list = [
            Service(name="Website Development", description="Full-stack custom Web Application development using React & FastAPI.", price=3500.0, duration=2400),
            Service(name="Video Production", description="High-impact promotional and technical explainer video production.", price=2200.0, duration=1200),
            Service(name="Social Media Management", description="End-to-end content creation, scheduling, and community engagement.", price=1500.0, duration=7200),
            Service(name="Graphic Design & Branding", description="Complete brand identity, logo, neo-brutalist UI components, and design system.", price=1800.0, duration=1800),
            Service(name="Marketing & Tech Strategy", description="Comprehensive architecture review, SEO optimization, and digital strategy.", price=1200.0, duration=600),
        ]
        db.add_all(service_list)
        db.commit()

        # Query inserted IDs
        customers = db.query(Customer).all()
        services = db.query(Service).all()
        employees = db.query(Employee).all()

        print("Seeding Service Requests...")
        now = datetime.now(timezone.utc)
        requests_data = [
            # Pending
            ServiceRequest(customer_id=customers[0].id, service_id=services[0].id, employee_id=None, title="Portal Modernization", description="Upgrade legacy PHP portal to React/FastAPI architecture.", status="PENDING", priority="URGENT", created_at=now - timedelta(days=6)),
            ServiceRequest(customer_id=customers[1].id, service_id=services[3].id, employee_id=None, title="Brand Identity Refresh", description="Create high-impact branding guidelines and asset kit.", status="PENDING", priority="HIGH", created_at=now - timedelta(days=5)),
            ServiceRequest(customer_id=customers[2].id, service_id=services[4].id, employee_id=None, title="Cloud Strategy Audit", description="Assess AWS container performance and cost optimization.", status="PENDING", priority="MEDIUM", created_at=now - timedelta(days=4)),
            ServiceRequest(customer_id=customers[3].id, service_id=services[2].id, employee_id=None, title="Q4 Campaign Setup", description="Schedule winter social media campaigns across platforms.", status="PENDING", priority="LOW", created_at=now - timedelta(days=3)),
            
            # Assigned
            ServiceRequest(customer_id=customers[4].id, service_id=services[0].id, employee_id=employees[1].id, title="E-commerce Checkout Fix", description="Debug cart persistence issue on mobile viewport.", status="ASSIGNED", priority="URGENT", created_at=now - timedelta(days=5)),
            ServiceRequest(customer_id=customers[5].id, service_id=services[1].id, employee_id=employees[2].id, title="Security Product Video", description="Produce 2-minute product walkthrough video.", status="ASSIGNED", priority="HIGH", created_at=now - timedelta(days=4)),
            ServiceRequest(customer_id=customers[6].id, service_id=services[3].id, employee_id=employees[2].id, title="Annual Report Graphics", description="Design quarterly infographics and executive slides.", status="ASSIGNED", priority="MEDIUM", created_at=now - timedelta(days=3)),

            # In Progress
            ServiceRequest(customer_id=customers[7].id, service_id=services[0].id, employee_id=employees[1].id, title="Quantum Portal API Integration", description="Integrate REST API endpoints with authentication layers.", status="IN_PROGRESS", priority="HIGH", created_at=now - timedelta(days=4)),
            ServiceRequest(customer_id=customers[8].id, service_id=services[3].id, employee_id=employees[2].id, title="Neo-Brutalist UI Kit Design", description="Construct dark/light high-contrast component library.", status="IN_PROGRESS", priority="URGENT", created_at=now - timedelta(days=3)),
            ServiceRequest(customer_id=customers[9].id, service_id=services[4].id, employee_id=employees[0].id, title="DevOps Pipeline Setup", description="Configure GitHub Actions CI/CD to AWS EC2.", status="IN_PROGRESS", priority="MEDIUM", created_at=now - timedelta(days=2)),

            # Completed
            ServiceRequest(customer_id=customers[0].id, service_id=services[2].id, employee_id=employees[2].id, title="Product Launch Campaign", description="Executed social media blast for product v2 release.", status="COMPLETED", priority="HIGH", created_at=now - timedelta(days=10)),
            ServiceRequest(customer_id=customers[1].id, service_id=services[0].id, employee_id=employees[1].id, title="Patient Portal Hotfix", description="Resolved CORS error on auth tokens.", status="COMPLETED", priority="URGENT", created_at=now - timedelta(days=8)),
            ServiceRequest(customer_id=customers[2].id, service_id=services[1].id, employee_id=employees[2].id, title="Corporate Overview Teaser", description="Finalized 4K video teaser.", status="COMPLETED", priority="MEDIUM", created_at=now - timedelta(days=7)),
            ServiceRequest(customer_id=customers[3].id, service_id=services[3].id, employee_id=employees[2].id, title="Logo Vectorization", description="Exported SVG/PNG icon suites for web.", status="COMPLETED", priority="LOW", created_at=now - timedelta(days=6)),
            ServiceRequest(customer_id=customers[4].id, service_id=services[4].id, employee_id=employees[0].id, title="SEO Metadata Optimization", description="Audited H1 tags, meta titles, and sitemaps.", status="COMPLETED", priority="MEDIUM", created_at=now - timedelta(days=5)),

            # Cancelled
            ServiceRequest(customer_id=customers[5].id, service_id=services[2].id, employee_id=None, title="Event Coverage", description="Cancelled due to venue rescheduling.", status="CANCELLED", priority="LOW", created_at=now - timedelta(days=8)),
            ServiceRequest(customer_id=customers[6].id, service_id=services[0].id, employee_id=employees[1].id, title="Flash Sale Landing Page", description="Project shelved by marketing department.", status="CANCELLED", priority="MEDIUM", created_at=now - timedelta(days=7)),
        ]
        db.add_all(requests_data)
        db.commit()

        print("Seeding Appointments...")
        appointments_list = [
            Appointment(customer_id=customers[0].id, service_id=services[0].id, employee_id=employees[1].id, appointment_date=now + timedelta(days=1, hours=2), status="SCHEDULED", notes="Kickoff call for portal modernization."),
            Appointment(customer_id=customers[1].id, service_id=services[3].id, employee_id=employees[2].id, appointment_date=now + timedelta(days=2, hours=4), status="CONFIRMED", notes="Review initial moodboards and brutalist color palettes."),
            Appointment(customer_id=customers[4].id, service_id=services[0].id, employee_id=employees[1].id, appointment_date=now + timedelta(days=3, hours=1), status="CONFIRMED", notes="Screen-share session for checkout debugging."),
            Appointment(customer_id=customers[7].id, service_id=services[0].id, employee_id=employees[1].id, appointment_date=now + timedelta(days=4, hours=3), status="SCHEDULED", notes="API spec verification and JWT authentication handoff."),
            Appointment(customer_id=customers[0].id, service_id=services[2].id, employee_id=employees[2].id, appointment_date=now - timedelta(days=2), status="COMPLETED", notes="Final campaign performance wrap-up call."),
            Appointment(customer_id=customers[1].id, service_id=services[0].id, employee_id=employees[1].id, appointment_date=now - timedelta(days=3), status="COMPLETED", notes="Emergency hotfix post-mortem meeting."),
            Appointment(customer_id=customers[5].id, service_id=services[2].id, employee_id=None, appointment_date=now - timedelta(days=4), status="CANCELLED", notes="Meeting cancelled with client."),
        ]
        db.add_all(appointments_list)
        db.commit()

        print("Seeding finished successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
