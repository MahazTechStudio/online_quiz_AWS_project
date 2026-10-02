import type { User, Quiz, Question, QuizAttempt } from "@/types";

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Mahaz Khan",
    email: "student@university.edu",
    role: "student",
    studentId: "U2024001",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    createdAt: "2026-01-15T08:30:00.000Z",
  },
  {
    id: "u2",
    name: "Admin User",
    email: "admin@university.edu",
    role: "admin",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces",
    createdAt: "2026-01-01T10:00:00.000Z",
  },
];

export const mockQuizzes: Quiz[] = [
  {
    id: "q1",
    title: "AWS Fundamentals",
    description:
      "Comprehensive assessment covering core AWS services including compute (EC2, Lambda), storage (S3), database (RDS, DynamoDB), networking (VPC), security (IAM), and monitoring (CloudWatch). Evaluate your understanding of AWS architectural best practices and service use cases.",
    category: "AWS Fundamentals",
    difficulty: "Intermediate",
    durationMins: 30,
    attemptsAllowed: 1,
    questionCount: 8,
    status: "published",
    createdAt: "2026-09-10T09:00:00.000Z",
  },
  {
    id: "q2",
    title: "Cloud Computing Basics",
    description:
      "Foundational concepts in cloud computing including service models (SaaS, PaaS, IaaS), deployment models (public, private, hybrid, community), virtualization fundamentals, scalability vs elasticity, CAP theorem, and the shared responsibility model. Ideal for students beginning their cloud journey.",
    category: "Cloud Computing",
    difficulty: "Beginner",
    durationMins: 25,
    attemptsAllowed: 2,
    questionCount: 8,
    status: "published",
    createdAt: "2026-09-05T11:00:00.000Z",
  },
  {
    id: "q3",
    title: "Networking Essentials",
    description:
      "Core networking principles including the OSI seven-layer model, TCP/IP protocol suite comparison, DNS resolution process, IP subnetting and CIDR notation, HTTP/HTTPS protocol differences, network devices (routers, switches, firewalls), NAT traversal, and well-known port numbers for common services.",
    category: "Networking",
    difficulty: "Intermediate",
    durationMins: 35,
    attemptsAllowed: 2,
    questionCount: 7,
    status: "published",
    createdAt: "2026-08-28T14:30:00.000Z",
  },
  {
    id: "q4",
    title: "Database Fundamentals",
    description:
      "Relational and non-relational database concepts including SQL vs NoSQL paradigms, ACID transaction properties, B-tree and hash indexes, primary/foreign/ composite key constraints, normalization forms (1NF through BCNF), inner/outer/self/cross joins, and CAP theorem applications in distributed database systems.",
    category: "Database",
    difficulty: "Beginner",
    durationMins: 30,
    attemptsAllowed: 2,
    questionCount: 7,
    status: "published",
    createdAt: "2026-08-20T16:00:00.000Z",
  },
  {
    id: "q5",
    title: "Serverless Computing",
    description:
      "Advanced serverless architecture patterns covering AWS Lambda execution environment and cold start optimization, API Gateway integration strategies, event-driven design patterns, DynamoDB Streams and CDC processing, SQS vs SNS messaging paradigms, Fargate container orchestration compared to Lambda, and serverless cost-performance trade-offs.",
    category: "Serverless",
    difficulty: "Advanced",
    durationMins: 40,
    attemptsAllowed: 1,
    questionCount: 8,
    status: "draft",
    createdAt: "2026-09-25T13:15:00.000Z",
  },
];

export const mockQuestions: Question[] = [
  {
    id: "q1-q1",
    quizId: "q1",
    text: "A university department needs to host a long-running, CPU-intensive batch processing workload that executes overnight for 6-8 hours with predictable, steady resource utilization. The workload requires custom kernel-level system configurations and full control over the operating environment. Which AWS compute service is the MOST appropriate and cost-effective choice?",
    options: [
      "Amazon Lambda with provisioned concurrency to eliminate cold starts and ensure consistent performance",
      "Amazon EC2 using Reserved Instances (1-year term, All Upfront payment) for steady-state predictable workloads",
      "AWS Fargate with Spot capacity provider to leverage discounted spot pricing for batch jobs",
      "Amazon ECS on EC2 using cluster auto-scaling with mixed On-Demand and Spot instances",
    ],
    correctOption: 1,
    explanation:
      "Long-running steady-state workloads requiring OS-level control are best suited for EC2. Reserved Instances provide significant cost savings (up to 75% vs On-Demand) for predictable, multi-hour overnight jobs. Lambda is inappropriate because of its 15-minute maximum execution timeout. Fargate, while serverless, still runs containers and does not provide kernel-level access, and spot pricing carries termination risk for non-interruptible batch workloads.",
  },
  {
    id: "q1-q2",
    quizId: "q1",
    text: "A startup is building a serverless image processing pipeline. When a user uploads a photo to Amazon S3, the system must generate three thumbnail sizes, extract EXIF metadata, and store results in both S3 and Amazon DynamoDB. Which solution represents the MOST decoupled and operationally efficient architecture?",
    options: [
      "Configure S3 Event Notifications to directly invoke a single Lambda function that performs all four operations sequentially (thumbnails, EXIF extraction, S3/DynamoDB writes)",
      "Create an S3 Event Notification that publishes to an Amazon SNS FIFO topic with four Lambda subscribers, one per operation, guaranteeing ordered processing",
      "Configure S3 Events to send messages to an Amazon SQS standard queue, then integrate SQS as an event source for a Lambda function that processes each message in batches of up to 10 items",
      "Set up an S3 Event Notification to trigger AWS Step Functions, which orchestrates four parallel Lambda tasks: three thumbnail generation tasks and one metadata extraction task, with automatic error handling and retries",
    ],
    correctOption: 3,
    explanation:
      "AWS Step Functions is the correct choice for orchestrating multiple parallel tasks with built-in error handling, retries, and visual workflow monitoring. While a single Lambda (Option 1) is simpler, it creates tight coupling and long execution times. SNS FIFO (Option 2) adds ordering complexity not needed here. SQS with Lambda (Option 3) is good for async queuing but does not natively orchestrate parallel task execution with the granular error handling Step Functions provides for each processing step.",
  },
  {
    id: "q1-q3",
    quizId: "q1",
    text: "A security auditor requires granular, API-level tracking of all actions performed within an AWS account over the past 90 days, including who performed each action, from which IP address, at what timestamp, and whether the action succeeded or failed. Which AWS service natively provides this capability, and what is the default data retention period?",
    options: [
      "Amazon CloudWatch Logs with log groups configured to receive management events; default retention is indefinitely permanent once configured",
      "AWS CloudTrail with an active trail applied to all regions; default event history retention in the CloudTrail console is 90 days",
      "AWS Config with configuration recorders enabled for all resource types; default retention is 7 years for configuration items",
      "Amazon GuardDuty with threat detection enabled for management console sign-ins; default finding retention is 180 days",
    ],
    correctOption: 1,
    explanation:
      "AWS CloudTrail records all API calls (management and data events) and stores them in event history for a default of 90 days, capturing IAM principal, source IP, timestamp, response elements, and error codes. CloudWatch Logs (Option 1) receives logs but does not natively capture API-level audit trails. AWS Config (Option 3) tracks resource configuration state changes, not API calls. GuardDuty (Option 4) performs threat analysis and anomaly detection rather than complete audit logging.",
  },
  {
    id: "q1-q4",
    quizId: "q1",
    text: "An application developer needs to choose a storage solution for a student records database that must support strongly consistent reads, complex transactional queries with multi-table JOIN operations, and must maintain ACID compliance for enrollment updates. The current database size is 400 GB with estimated growth of 20 GB per month. Which AWS service combination is MOST appropriate?",
    options: [
      "Amazon DynamoDB with global secondary indexes to simulate JOIN operations, using DynamoDB Transactions for ACID guarantees across items",
      "Amazon RDS for PostgreSQL with Multi-AZ deployment enabled for high availability, leveraging PostgreSQL native JOIN support and full ACID compliance",
      "Amazon S3 with Athena ad-hoc querying, using Parquet columnar storage format and partition projections for query performance optimization",
      "Amazon DocumentDB (with MongoDB compatibility) using aggregation pipelines with $lookup stages to emulate JOIN operations between collections",
    ],
    correctOption: 1,
    explanation:
      "Amazon RDS for PostgreSQL (or any RDBMS engine) natively supports complex JOINs and full ACID compliance out of the box, making it ideal for relational student records data. Multi-AZ provides automatic failover. DynamoDB (Option 1) is a NoSQL key-value store that does not efficiently support ad-hoc JOINs; GSI queries are limited, and DynamoDB Transactions only apply to items within the same account/region. S3 + Athena (Option 3) is analytical, not operational. DocumentDB $lookup (Option 4) exists but is limited compared to PostgreSQL and not designed for transactional, normalized relational workloads.",
  },
  {
    id: "q1-q5",
    quizId: "q1",
    text: "A solutions architect is designing the network topology for a three-tier web application consisting of public-facing web servers, private application servers, and private database servers. The web servers must receive inbound traffic from the internet on HTTPS port 443 only. The application servers must only accept traffic from the web tier, and the database servers must only accept MySQL port 3306 traffic from the application tier. What is the correct security group configuration approach?",
    options: [
      "Create a single, comprehensive security group applied to all three tiers, with rules allowing 0.0.0.0/0 inbound on 443 and 3306, and use Network ACLs at the subnet level to control traffic between tiers",
      "Create three separate security groups (WebSG, AppSG, DB SG). WebSG allows inbound 443 from 0.0.0.0/0. AppSG allows inbound all traffic from WebSG. DB SG allows inbound 3306 from AppSG. All three allow all outbound traffic (0.0.0.0/0) by default",
      "Place all instances in public subnets with elastic IPs, configure one security group per tier with CIDR-based rules referencing the other tier subnet CIDR ranges rather than security group IDs",
      "Create one VPC peering connection per tier boundary: one peering connection between web and app subnets, and another between app and database subnets, with route table entries directing traffic through the peering connections",
    ],
    correctOption: 1,
    explanation:
      "Security group chaining (referencing other security groups by ID rather than CIDR) is the AWS best practice for tiered architectures. It scales automatically as instances are added to tiers, unlike static CIDR rules. Option 1 creates an overly broad single security group violating least-privilege. Option 3 uses CIDR instead of SG ID references, breaking automatic membership tracking. Option 4 misunderstands VPC peering, which connects entire VPCs, not subnets within the same VPC.",
  },
  {
    id: "q1-q6",
    quizId: "q1",
    text: 'A DevOps engineer needs to implement the principle of least privilege for an IAM role used by a nightly batch job running on EC2. The batch job needs to read objects from a specific S3 bucket (prod-reports-bucket) with the prefix "incoming/" and write processed CSV files only to prefix "processed/" within the same bucket. The job must also be able to create CloudWatch Logs streams and write log events. Which policy structure is correct?',
    options: [
      "Attach the managed AmazonS3FullAccess policy and CloudWatchAgentServerPolicy to the role, then use a Service Control Policy at the OU level to deny access to other buckets",
      "Create an inline policy with three statements: (1) Allow s3:GetObject on arn:aws:s3:::prod-reports-bucket/incoming/*, (2) Allow s3:PutObject on arn:aws:s3:::prod-reports-bucket/processed/*, (3) Allow logs:CreateLogStream and logs:PutLogEvents on arn:aws:logs:*:*:log-group:/aws/batch/*",
      "Create a bucket policy on prod-reports-bucket that allows the role ARN to s3:* on all prefixes, and use CloudWatch resource-based policies to permit logging access",
      "Use an IAM Permissions Boundary set to AmazonS3ReadOnlyAccess, then attach inline policies granting the specific Write permissions and CloudWatch Logs permissions that override the boundary",
    ],
    correctOption: 1,
    explanation:
      "An inline policy with three explicit statements scoped to the exact resource ARNs and actions embodies least privilege. Managed full-access policies (Option 1) violate least privilege even with SCP denials. Bucket policies alone (Option 3) do not grant IAM permissions — identity policies are required for IAM principals to act. Permissions Boundaries (Option 4) set the MAXIMUM permissions; a ReadOnly boundary would prevent writes regardless of attached inline policies, making the configuration contradictory.",
  },
  {
    id: "q1-q7",
    quizId: "q1",
    text: "A company operates an e-commerce platform using Amazon DynamoDB for its shopping cart table. During a Black Friday flash sale, monitoring reveals that read operations are achieving only eventually consistent reads, yet the checkout process requires reading user cart data with absolute strong consistency immediately after write operations (read-after-write). Which configuration change achieves strong consistency while minimizing cost impact?",
    options: [
      "Enable DynamoDB Global Tables with multi-region replication, and configure the application to read from the nearest replica region using global tables version 2.0",
      "Modify application read requests to set ConsistentRead=true when querying the cart table immediately after user-initiated item additions or updates, accepting the 2x read capacity unit consumption",
      "Switch the DynamoDB table from Provisioned Throughput mode to On-Demand mode, which natively provides strongly consistent reads at all times without explicit configuration",
      "Create a DynamoDB Accelerator (DAX) cluster positioned in front of the table, with Write-Through caching mode enabled so cache writes synchronously propagate to the DynamoDB table",
    ],
    correctOption: 1,
    explanation:
      "Setting ConsistentRead=true in the query/get-item request parameters is the correct and standard method to achieve strong consistency on individual DynamoDB reads. It doubles RCU consumption (1 strongly consistent read = 2 eventually consistent reads) but is the simplest and most targeted fix. Global Tables (Option 1) provides multi-region redundancy but does not solve single-region read-after-write consistency issues. On-Demand mode (Option 3) is a billing/capacity mode and does not change consistency behavior. DAX (Option 4) is an in-memory cache providing microsecond reads but is eventually consistent by design and does not guarantee strong consistency across cache writes.",
  },
  {
    id: "q1-q8",
    quizId: "q1",
    text: "A university is migrating 60 TB of historical research data from an on-premises Network Attached Storage (NAS) appliance to Amazon S3 Glacier Deep Archive for long-term regulatory retention. The campus has a reliable 500 Mbps symmetrical internet connection. What is the FASTEST and MOST cost-effective migration approach?",
    options: [
      "Deploy the AWS CLI on multiple on-premises servers, run parallel aws s3 cp commands with --content-md5 validation checks, and use S3 Transfer Acceleration endpoints to upload directly into S3 Glacier Deep Archive storage class",
      "Order two AWS Snowball Edge Storage Optimized devices from the AWS console, transfer data to each device locally using the Snowball client, ship the devices back to AWS, and configure an S3 Lifecycle policy to transition the uploaded Standard class objects to Glacier Deep Archive after ingestion",
      "Configure a 1 Gbps AWS Direct Connect dedicated connection from the university campus to the nearest AWS Region, use AWS DataSync with a public VIF endpoint, and configure the DataSync task with the --storage-class DEEP_ARCHIVE option",
      "Use AWS DataSync with the on-premises DataSync agent installed on a virtual machine connected to the NAS, schedule incremental recurring sync tasks, and set the destination S3 storage class to Glacier Deep Archive on the first full sync execution",
    ],
    correctOption: 1,
    explanation:
      "Two Snowball Edge Storage Optimized devices (80 TB capacity each, usable ~60 TB) is fastest for 60 TB: local transfer at ~10 Gbps internal speed, then overnight shipping. At 500 Mbps internet, Option 1 would take ~10+ days of continuous saturated transfer with transfer fees. Direct Connect (Option 3) requires provisioning lead time (weeks) and is overkill for a one-time 60 TB migration. DataSync over internet (Option 4) is excellent for ongoing transfers but still limited by the 500 Mbps pipe speed, making Snowball significantly faster for one-time large-scale data seeding.",
  },

  {
    id: "q2-q1",
    quizId: "q2",
    text: "A startup is evaluating cloud service models for a new customer relationship management (CRM) application. The company has a very small engineering team with limited DevOps capacity, needs rapid go-to-market within two weeks, requires automatic upgrades and patches, and is willing to trade some customization speed for reduced operational overhead. Which service model BEST aligns with these requirements?",
    options: [
      "Infrastructure as a Service (IaaS): Provision virtual machines, storage, and networking infrastructure in the cloud, installing and maintaining the CRM platform and all middleware manually",
      "Platform as a Service (PaaS): Deploy a custom-built CRM application onto a managed application platform such as Heroku, AWS Elastic Beanstalk, or Azure App Service",
      "Software as a Service (SaaS): Subscribe to a commercially available CRM product such as Salesforce, HubSpot, or Zoho CRM accessible via web browser with built-in updates",
      "Bare-Metal as a Service (BMaaS): Lease dedicated physical servers in a colocation provider data center, retaining full control over hardware and software stacks",
    ],
    correctOption: 2,
    explanation:
      "SaaS is correct: the CRM software is delivered over the internet, fully managed by the vendor with automatic patches, requiring no infrastructure or DevOps work — enabling 2-week go-live. IaaS (Option 1) requires installing and maintaining everything, which the small team cannot handle. PaaS (Option 2) still requires building the CRM application itself, which cannot be done in two weeks. BMaaS (Option 4) provides physical servers only, requiring the customer to handle all software including hypervisors, OS, middleware, and the CRM itself.",
  },
  {
    id: "q2-q2",
    quizId: "q2",
    text: "A multinational financial institution with strict data sovereignty laws and regulatory compliance requirements wants to adopt cloud computing. The compliance team has mandated that customer PII (personally identifiable information) must never leave company-owned hardware, yet the marketing department needs elastic compute capacity for periodically running customer segmentation analytics using non-sensitive data. Which cloud deployment model is the MOST appropriate?",
    options: [
      "Public Cloud model exclusively, using provider data center encryption at rest combined with client-side envelope encryption before upload to protect PII data in shared infrastructure",
      "Private Cloud model exclusively, deploying an on-premises VMware vSphere or OpenStack private cloud environment using company-owned servers to host all workloads, including marketing analytics",
      "Hybrid Cloud model, placing PII workloads and the core banking system in an on-premises private cloud while bursting marketing analytics workloads to the public cloud during peak demand periods via encrypted VPN connectivity",
      "Community Cloud model, joining a shared financial services community cloud operated by a consortium of banks, leveraging shared compliance certifications across all consortium members",
    ],
    correctOption: 2,
    explanation:
      'A hybrid cloud combines private (PII on company hardware, meeting sovereignty) and public clouds (elastic, cost-effective marketing analytics burst capacity) with secure connectivity. Public cloud only (Option 1) violates the "never leave company-owned hardware" mandate regardless of encryption. Private cloud only (Option 2) removes the elasticity benefit for periodic analytics workloads. Community cloud (Option 4) is shared among multiple organizations and thus does not satisfy the requirement that PII stays on institution-owned hardware specifically.',
  },
  {
    id: "q2-q3",
    quizId: "q2",
    text: "A cloud customer is reviewing IaaS virtual machine configurations. Which of the following components is the SOLE responsibility of the cloud customer under the standard AWS/Azure/GCP shared responsibility model for IaaS compute workloads?",
    options: [
      "Physical data center security including perimeter fencing, biometric access controls, security guard staffing, and CCTV surveillance monitoring",
      "Physical server hardware maintenance including CPU/RAM replacement, storage drive health monitoring, power supply redundancy, and network switch firmware patches",
      "Hypervisor patches, virtualization infrastructure security updates, and physical networking infrastructure configuration and management",
      "Guest operating system configuration management including security patches, local firewall rules, endpoint protection agents, SSH key rotation, and application-level dependencies",
    ],
    correctOption: 3,
    explanation:
      "In IaaS shared responsibility, the cloud provider manages everything BELOW the hypervisor (physical facilities, hardware, hypervisor itself, Options 1-2-3). The customer is responsible for everything ABOVE the hypervisor: the guest OS, patches, firewall, and all software/application layers. This is a fundamental distinction: IaaS customers have OS control but no hardware access. In PaaS, the provider additionally manages OS patching.",
  },
  {
    id: "q2-q4",
    quizId: "q2",
    text: "An e-commerce website experiences predictable traffic patterns: approximately 4,000 concurrent users Monday-Friday from 9:00-17:00 local time, and 500 concurrent users at all other times including weekends. The business plans to add server capacity so that when workload demand increases during work hours, additional web server instances are provisioned automatically, then deprovisioned after business hours. Which cloud characteristic BEST describes this automated adjustment of compute resources?",
    options: [
      "Elasticity — the ability to dynamically acquire and release computing resources in response to short-term workload fluctuations, scaling up and down automatically as needed",
      "Scalability — the ability of a system to handle growth in workload by adding more resources (scale out/horizontal scaling) or upgrading existing resources (scale up/vertical scaling)",
      "High Availability — the ability of the system to remain operational and accessible by eliminating single points of failure and deploying workloads across multiple availability zones",
      "Fault Tolerance — the built-in redundancy capability that allows a system to continue operating automatically without interruption despite failure of individual components such as servers or network links",
    ],
    correctOption: 0,
    explanation:
      "Elasticity specifically means dynamically adding/REMOVING resources in response to short-term changes — scaling up and down automatically. Scalability (Option 1) is about handling GROWTH (adding more as needed, but not necessarily removing). In the scenario given, both ADDING instances during the day and REMOVING them at night occurs, which fits elasticity perfectly. High Availability (Option 2) and Fault Tolerance (Option 3) are about reliability and redundancy design rather than dynamic resource adjustment based on load patterns.",
  },
  {
    id: "q2-q5",
    quizId: "q2",
    text: "In the context of distributed cloud-native systems, the CAP theorem (Brewers Theorem) states that a distributed data store can only simultaneously provide at most two out of three desirable properties. A distributed NoSQL database is configured such that when a network partition (split) occurs between data center regions, the system continues to accept write operations from both sides of the partition and resolves conflicts using vector timestamps when the partition heals. Which CAP properties are being prioritized during the partition?",
    options: [
      "Consistency and Partition Tolerance (CP system): the system ensures every read receives the most recent write or an error, blocking write operations during the network partition",
      "Availability and Partition Tolerance (AP system): the system ensures every request receives a non-error response, potentially serving stale data during the network partition",
      "Consistency and Availability (CA system): the system guarantees both strong consistency across all nodes and 100% availability for all requests during network partitions",
      "Consistency, Availability, and Partition Tolerance simultaneously (CAP-complete system): modern cloud distributed databases have evolved beyond the original CAP theorem constraints and can achieve all three properties concurrently",
    ],
    correctOption: 1,
    explanation:
      "During a network partition, CAP theorem forces a binary choice between C and A. Since this system accepts writes on BOTH sides of the partition (staying available for writes) rather than blocking to preserve consistency, it is an AP system: Availability + Partition Tolerance. A CP system (Option 1) would refuse writes to maintain consistency. Option 3 is wrong because CA systems cannot exist in the presence of a partition — Partition Tolerance is non-negotiable for distributed systems. Option 4 is fundamentally incorrect; the CAP trade-off is mathematically proven and modern systems still obey it, though they may have sophisticated eventual consistency mechanisms.",
  },
  {
    id: "q2-q6",
    quizId: "q2",
    text: "What is the primary difference between Type 1 (Bare-Metal) hypervisors and Type 2 (Hosted) hypervisors in server virtualization technology, and which type is predominantly used in major public cloud data centers?",
    options: [
      "Type 1 hypervisors (e.g., VMware Workstation, Oracle VirtualBox) run directly as software applications on top of a general-purpose host operating system such as Windows or Linux. Type 2 hypervisors (e.g., VMware ESXi, Microsoft Hyper-V Server, KVM) run directly on physical hardware without a host OS. Public clouds use Type 2 primarily.",
      "Type 1 hypervisors (e.g., VMware ESXi, AWS Nitro Hypervisor, Azure Hyper-V, KVM) run directly on physical server hardware without an intervening general-purpose OS. Type 2 hypervisors (e.g., VMware Workstation, Parallels Desktop, VirtualBox) run as applications on a conventional host OS. Public clouds exclusively use Type 1 hypervisors.",
      "Type 1 hypervisors provide software-only virtualization using binary translation. Type 2 hypervisors require hardware-assisted virtualization extensions (Intel VT-x, AMD-V). Performance is identical between the two types; they differ only in licensing cost structures.",
      "Both types are architecturally identical; the terminology difference reflects commercial branding. Major public clouds use a proprietary hybrid third type of hypervisor not available to on-premises customers.",
    ],
    correctOption: 1,
    explanation:
      "Type 1 (bare-metal) hypervisors install on raw hardware, directly managing VMs with minimal overhead — this is what AWS (Nitro/Xen), GCP (KVM), Azure (Hyper-V) use for performance and isolation. Type 2 (hosted) hypervisors are desktop applications running on top of Windows/macOS/Linux, used primarily for development/testing on end-user PCs (VMware Workstation, VirtualBox). Option 1 reverses the definitions. Option 3 incorrectly describes virtualization techniques and performance. Option 4 is factually incorrect.",
  },
  {
    id: "q2-q7",
    quizId: "q2",
    text: "Which of the following scenarios represents the PRIMARY disadvantage of the Infrastructure as a Service (IaaS) cloud service model compared to Platform as a Service (PaaS) or Software as a Service (SaaS)?",
    options: [
      "Severely limited flexibility — customers cannot install custom operating systems, kernel modules, or proprietary software applications on IaaS virtual machines due to hypervisor-level restrictions enforced by cloud providers",
      "Significantly higher operational management overhead — customers retain responsibility for guest operating system patching, vulnerability remediation, antivirus/endpoint protection, backup management, and runtime security hardening",
      "Inability to horizontally scale — IaaS VMs can only be vertically scaled (resized to larger instance sizes) and do not support load balancing or auto-scaling groups across multiple VM instances",
      "Vendor lock-in is far greater in IaaS than in any other cloud service model because IaaS VMs use proprietary hypervisor formats that cannot be exported or migrated to other cloud providers or on-premises data centers",
    ],
    correctOption: 1,
    explanation:
      "IaaS operational overhead (OS patching, etc.) is its defining drawback compared to PaaS (which abstracts OS management) and SaaS (which abstracts everything). Flexibility (Option 1) is actually an IaaS STRENGTH — you get full OS control. Horizontal scaling with auto-scaling groups and load balancers (Option 3) is a core IaaS capability. IaaS vendor lock-in (Option 4) is actually LOWER than PaaS/SaaS because virtual machines can be exported/imported via industry standard formats (OVF, VMDK) and workloads migrated to any hypervisor.",
  },
  {
    id: "q2-q8",
    quizId: "q2",
    text: "A university IT department is evaluating whether to migrate its on-premises Learning Management System (Moodle) to the public cloud versus maintaining the existing on-premises deployment. Which factor represents a financial ADVANTAGE of cloud adoption (specifically the pay-as-you-go pricing model) over on-premises capital expenditure procurement?",
    options: [
      "Zero ongoing operational costs in the cloud — once cloud migration is complete, the university pays nothing further for compute, storage, or network data transfer resources consumed by the LMS workload",
      "Elimination of upfront capital expenditure for server hardware procurement — the university can avoid the significant one-time cost of purchasing physical servers, storage arrays, and network switches, converting CapEx to OpEx",
      "Total cost of ownership over a 10-year horizon is always lower in the public cloud compared to operating an equivalent workload on on-premises infrastructure of any scale",
      "Pay-as-you-go cloud pricing guarantees the university will pay the same fixed monthly amount indefinitely, with no price fluctuations based on actual resource consumption, enabling precise long-term budget forecasting",
    ],
    correctOption: 1,
    explanation:
      "The primary financial benefit of pay-as-you-go is CapEx → OpEx conversion: no upfront hardware purchases, paying only for usage. Option 1 is wrong — cloud has monthly usage-based OpEx costs that never become zero. Option 3 is wrong: TCO depends heavily on workload scale; at large steady-state scales, on-premises can be cheaper over 10-year horizons (hence Reserved Instances, Savings Plans exist to narrow the gap). Option 4 is wrong; pay-as-you-go is variable, not fixed — that is the entire point (cost fluctuates with usage).",
  },

  {
    id: "q3-q1",
    quizId: "q3",
    text: "Match each OSI seven-layer model function to its correct layer number: (1) Establishing, managing, and terminating application sessions between hosts; (2) Route selection between autonomous systems using IP addressing and routing protocols like BGP and OSPF; (3) MAC address-based switching between devices on the same LAN segment using physical hardware addresses; (4) End-to-end reliable data delivery via TCP acknowledgments and flow control.",
    options: [
      "(1) = Layer 5 Session; (2) = Layer 3 Network; (3) = Layer 2 Data Link; (4) = Layer 4 Transport",
      "(1) = Layer 7 Application; (2) = Layer 4 Transport; (3) = Layer 1 Physical; (4) = Layer 3 Network",
      "(1) = Layer 6 Presentation; (2) = Layer 2 Data Link; (3) = Layer 3 Network; (4) = Layer 5 Session",
      "(1) = Layer 5 Session; (2) = Layer 7 Application; (3) = Layer 4 Transport; (4) = Layer 2 Data Link",
    ],
    correctOption: 0,
    explanation:
      "OSI model layers from 1 (bottom) to 7 (top): Physical (1), Data Link (2) = MAC switching, Network (3) = IP routing, Transport (4) = TCP/UDP, Session (5) = session management, Presentation (6) = data formatting/encryption, Application (7) = HTTP/SSH/etc. The correct mapping is Session/5 manages sessions, Network/3 does routing, Data Link/2 does MAC switching, Transport/4 handles TCP reliability. Option 1 jumbles Layer 7/4/1/3 incorrectly. Option 2 assigns Presentation/Session to Layer 6/5 wrong. Option 3 swaps 7/4/2 positions.",
  },
  {
    id: "q3-q2",
    quizId: "q3",
    text: "When designing a live video streaming application for a global audience and a separate automated file transfer service that guarantees 100% complete and correct file delivery between servers, which transport layer protocol should be selected for each workload, and what is the core architectural reason?",
    options: [
      "Both workloads should use TCP exclusively. TCP is universally optimal for all network applications because its built-in retransmission mechanism, sequence numbering, and congestion control algorithms eliminate packet loss and guarantee perfect application performance under all network conditions",
      "Live video streaming should use UDP because dropped video packets cause minor visual artifacts but do not require retransmission (latency-sensitive, loss-tolerant). Automated file transfer should use TCP because it requires 100% accurate in-order delivery with acknowledgments, retransmission, and checksum-based integrity verification",
      "Live video streaming should use TCP because its sliding window flow control ensures smooth playback without buffering. Automated file transfer should use UDP because its small 8-byte header minimizes overhead when transferring large multi-gigabyte files across high-bandwidth links",
      "Both workloads should use UDP exclusively. The minimal 8-byte header compared to TCPs 20+ byte header provides significantly higher throughput in all cases, and any reliability requirements can be more efficiently implemented at the application layer",
    ],
    correctOption: 1,
    explanation:
      "UDP = low latency, no retransmission, suitable for real-time voice/video where occasional dropped packets are preferable to the delays caused by retransmissions. TCP = guaranteed in-order delivery, retransmits lost segments, ideal for file transfer/web browsing where correctness is non-negotiable. Option 1 is wrong: TCP retransmissions cause buffering making live streaming unplayable. Option 2 swaps both and gets reasoning backwards. Option 4 is wrong: reimplementing TCP reliability at application layer is complex and performs worse than battle-tested kernel TCP stacks.",
  },
  {
    id: "q3-q3",
    quizId: "q3",
    text: "A network administrator configures a new IPv4 subnet for a computer lab. The assigned network address is 192.168.45.0/26 using Classless Inter-Domain Routing (CIDR) notation. How many usable host IP addresses are available to assign to end-user devices (PCs, printers, access points) within this subnet, and what is the broadcast address of the subnet?",
    options: [
      "62 usable hosts; broadcast address = 192.168.45.63",
      "64 usable hosts; broadcast address = 192.168.45.255",
      "30 usable hosts; broadcast address = 192.168.45.31",
      "126 usable hosts; broadcast address = 192.168.45.127",
    ],
    correctOption: 0,
    explanation:
      "A /26 prefix means 26 network bits, leaving 6 host bits (32-26=6). Total addresses = 2^6 = 64. Subtract 2 reserved addresses (network + broadcast) → 62 usable hosts. Network = 192.168.45.0, first usable .1, last usable .62, broadcast = .63. Option 1 forgets to subtract the 2 reserved addresses and uses the classful broadcast. Option 2 calculates /27 (5 host bits: 30 hosts, 31 broadcast). Option 4 calculates /25 (7 host bits: 126 hosts, 127 broadcast).",
  },
  {
    id: "q3-q4",
    quizId: "q3",
    text: "When a university student types https://moodle.university.edu/course/view.php?id=12345 into a browser address bar and presses Enter, the browser has no cached DNS records. Place the following steps in the CORRECT chronological order that they occur during the DNS resolution process before any HTTP/TLS connection is initiated: (A) Recursive DNS resolver queries the TLD nameserver for .edu; (B) Browser queries the local recursive DNS resolver (e.g., university or ISP DNS); (C) Recursive resolver queries the authoritative nameserver for university.edu; (D) Recursive resolver queries the DNS root nameserver; (E) Authoritative server returns the A record IP address to the recursive resolver; (F) Recursive resolver queries the TLD nameserver for university.edu domain delegation.",
    options: [
      "B → A → D → C → F → E",
      "B → D → A → F → C → E",
      "D → A → B → C → F → E",
      "B → D → F → A → C → E",
    ],
    correctOption: 1,
    explanation:
      "Correct DNS resolution flow: 1. (B) Browser asks local recursive resolver. 2. (D) If no cache, resolver starts at ROOT nameserver (13 logical root servers). 3. (A) Root returns referral to .edu TLD nameservers; resolver queries .edu TLD. 4. (F) .edu TLD returns delegation to university.edu authoritative nameservers; resolver queries those. 5. (C) Resolver queries authoritative server for university.edu (moodle host record). 6. (E) Authoritative returns A record 1.2.3.4 to resolver, which caches and returns to browser. Option 1 goes from TLD back to root (wrong). Option 2 incorrectly starts at root without resolver query. Option 3 swaps TLD and university delegation order.",
  },
  {
    id: "q3-q5",
    quizId: "q3",
    text: "A home user with a single public IPv4 address (assigned dynamically via ISP DHCP) connects multiple devices (laptops, phones, smart TV, game console) to the internet through a Wi-Fi router using 192.168.1.0/24 private address space. When the game console initiates an outbound connection to a gaming server on the public internet, what mechanism does the home router perform to allow return traffic to reach the correct internal device?",
    options: [
      "Static Network Address Translation (Static NAT), where the network administrator pre-configures a permanent one-to-one mapping between each private IP address and a dedicated public IP address for every device on the home network",
      "Port Address Translation (PAT), also called NAT Overload, which maps multiple private IP addresses to a single public IP address by translating both the Layer 3 IP address and the Layer 4 source port number into unique entries in the routers NAT translation table",
      "Dynamic NAT with a public IP address pool, where the router maintains a pool of 254 public IP addresses leased from the ISP and temporarily assigns one per device on a first-come first-served basis when connections are initiated",
      "IPv6-to-IPv4 dual-stack translation (NAT64/DNS64), which automatically translates all private IPv4 packets into globally routable IPv6 packets before transmission across the public internet backbone",
    ],
    correctOption: 1,
    explanation:
      "PAT (NAT Overload) is the standard home router mechanism: all internal devices share ONE public IP using unique source port numbers. Return traffic is mapped back by matching the destination port to the NAT table entry. Static NAT (Option 1) requires a 1:1 IP mapping and manual config per device, not used in homes. Dynamic NAT with a pool (Option 2) requires multiple public IPs; the user only has ONE. NAT64 (Option 3) translates IPv6↔IPv4, which is not relevant here (the scenario is IPv4 throughout).",
  },
  {
    id: "q3-q6",
    quizId: "q3",
    text: "A network security engineer is implementing access control lists. Match each network service with its STANDARD assigned well-known TCP port number (IANA registered): SSH remote administration, HTTP web browsing, HTTPS encrypted web, DNS zone transfers, SMTP email submission, and Telnet unencrypted remote access.",
    options: [
      "SSH=22, HTTP=80, HTTPS=443, DNS zone transfer=53 TCP, SMTP=25, Telnet=23",
      "SSH=21, HTTP=8080, HTTPS=8443, DNS zone transfer=53 UDP, SMTP=110, Telnet=21",
      "SSH=23, HTTP=80, HTTPS=443, DNS zone transfer=123 TCP, SMTP=587, Telnet=22",
      "SSH=22, HTTP=80, HTTPS=8080, DNS zone transfer=953 UDP, SMTP=143, Telnet=7",
    ],
    correctOption: 0,
    explanation:
      "IANA standard well-known ports: SSH=22, HTTP=80, HTTPS=443, DNS zone transfers use TCP/53 (UDP/53 is for standard queries; full zone transfers AXFR/IXFR use TCP/53 because they can be large), SMTP (server-to-server email)=25, Telnet=23. Option 1 swaps SSH with FTP (21) and HTTP/S with common alternate ports, uses DNS UDP (no zone transfers), SMTP/POP3 wrong. Option 2 swaps SSH/Telnet, wrong DNS port (123=NTP), wrong SMTP (587=MSA submission, not standard SMTP). Option 3 uses HTTPS alt port, DNS wrong port, SMTP/IMAP wrong.",
  },
  {
    id: "q3-q7",
    quizId: "q3",
    text: "Which of the following accurately describes the difference between the function of a Layer 2 network switch and a Layer 3 router in a typical enterprise campus network architecture, including the packet modification behavior and forwarding decision criteria?",
    options: [
      "Switches operate at Layer 2 and forward Ethernet frames based on destination MAC addresses, maintaining a dynamic CAM (Content Addressable Memory) table mapping MAC addresses to physical switch ports without modifying the frame header. Routers operate at Layer 3 and forward IP packets based on destination IP addresses, using a routing table populated by static routes and routing protocols, and decrementing the IP header TTL field by 1 while rewriting the Layer 2 source and destination MAC addresses at each hop.",
      "Switches operate at Layer 3 and forward IP packets using routing tables across VLAN boundaries. Routers operate at Layer 2 and forward frames using MAC addresses within broadcast domains. Both devices rewrite both the Layer 2 MAC headers and Layer 3 IP addresses of every packet they process.",
      "Switches maintain routing tables populated via OSPF and BGP routing protocol advertisements. Routers maintain MAC address tables learned dynamically via flooding of broadcast ARP request messages. Neither device modifies packet headers; forwarding is purely a read-only lookup operation.",
      "Both switches and routers operate at identical network layers and perform identical functions. The only difference is port density — switches have many more Ethernet ports (24-48+) while routers have fewer, higher-speed WAN ports (1-16) dedicated to ISP connections.",
    ],
    correctOption: 0,
    explanation:
      "Layer 2 switches = MAC address + CAM table, intra-VLAN forwarding, no header modification except adding STP/VLAN tags. Layer 3 routers = IP address + routing table, decrement TTL, decrement/checksum, rewrite src/dst MAC on egress, inter-VLAN routing. Option 1 reverses Layer assignments. Option 2 swaps switch/router table types and incorrectly claims no TTL modification. Option 3 is wrong; they operate at entirely different layers and make different forwarding decisions based on different header fields.",
  },

  {
    id: "q4-q1",
    quizId: "q4",
    text: "A university registrar is designing a student enrollment database. The following requirements apply: the STUDENT table stores student_id, full_name, date_of_birth; the COURSE table stores course_code, title, credits, department_id; and a student may enroll in many courses while each course has many enrolled students. What type of relationship exists between STUDENT and COURSE, and what standard relational database construct must be implemented to model it correctly?",
    options: [
      "One-to-One (1:1) relationship: create a foreign key column course_id in the STUDENT table referencing COURSE.course_code, ensuring each student enrolls in exactly one course",
      "One-to-Many (1:N) relationship: create a foreign key column student_id in the COURSE table referencing STUDENT.student_id, allowing each course to have multiple enrolled students but each student enrolled in one course",
      "Many-to-Many (M:N) relationship: create a composite bridge/associative entity/junction table (e.g., ENROLLMENT) containing at minimum foreign key columns student_id and course_code, with a composite primary key formed from both foreign keys, plus optional additional attributes like enrollment_date and final_grade",
      "Recursive relationship: use a self-referencing foreign key within the STUDENT table pointing to another STUDENT row as their academic advisor, which implicitly creates course enrollment relationships through advisor course assignments",
    ],
    correctOption: 2,
    explanation:
      'M:N relationships require a junction table (bridge/associative entity) because neither table can hold a single foreign key — one student has N courses, one course has M students. The junction table contains two FKs (to each parent table) forming a composite PK plus optional relationship attributes (enrollment date, grade). Option 1 creates 1:1 which violates "many courses, many students." Option 2 creates 1:N with student owning course, which forces each course to have one student — wrong. Option 4 models a different (advisor-student) recursive relationship, not course enrollment.',
  },
  {
    id: "q4-q2",
    quizId: "q4",
    text: "A banking application performs a funds transfer between two accounts using SQL: (1) BEGIN TRANSACTION; (2) UPDATE accounts SET balance = balance - 500 WHERE account_id = 101; (3) UPDATE accounts SET balance = balance + 500 WHERE account_id = 202; (4) COMMIT TRANSACTION; Between statement (2) execution and statement (4) COMMIT execution, a server power failure occurs. When the database server restarts and performs crash recovery, which ACID property guarantees that BOTH updates (debit AND credit) are fully rolled back (neither partial state persists) so that account balances remain consistent?",
    options: [
      "Atomicity — the all-or-nothing property ensuring either every statement within a transaction commits successfully as an indivisible unit, or if interrupted, no partial effects are permanently written to the database through undo/redo log-based recovery",
      "Consistency — the database always transitions from one valid state to another valid state, enforcing all integrity constraints such as referential integrity, unique constraints, and check constraints at transaction commit time",
      "Isolation — concurrent transactions execute as if they were run serially (one after another) through MVCC or locking mechanisms, preventing dirty reads of uncommitted data from other concurrent transactions",
      "Durability — once a transaction is successfully committed, its effects are permanently persisted to non-volatile storage even in the event of subsequent power failures, crashes, or operating system restarts",
    ],
    correctOption: 0,
    explanation:
      "Atomicity = all-or-nothing, including handling interrupted transactions via WAL/undo log rollback during crash recovery. The scenario describes rollback of an UNCOMMITTED interrupted transaction. Consistency (Option 1) refers to enforcing constraints. Isolation (Option 2) governs concurrent transaction interference. Durability (Option 3) applies ONLY to transactions that successfully COMMITTED before the crash. The question specifically asks about the uncommitted transaction being fully rolled back on restart — this is precisely atomicity via undo logs.",
  },
  {
    id: "q4-q3",
    quizId: "q4",
    text: "A database table ORDERS contains 10 million rows with the following columns: order_id (PK, integer), customer_id (FK to customers), order_date (DATE), total_amount (DECIMAL), status (VARCHAR). A frequently executed report query runs: SELECT SUM(total_amount) FROM orders WHERE customer_id = ? AND order_date BETWEEN ? AND ? GROUP BY status; Which indexing strategy provides the BEST query performance for this specific report while minimizing write overhead and storage consumption?",
    options: [
      "Create 10 separate single-column non-clustered indexes: one on each column in the table (order_id, customer_id, order_date, total_amount, status), allowing the query optimizer to select the best single index at runtime using index intersection operators",
      "Create a composite (multi-column) non-clustered B-tree index on (customer_id, order_date, status, total_amount), placing the most selective equality predicate column first, then the range predicate, then the GROUP BY column, then the aggregated column to enable an index-only scan without visiting the base table (heap/clustered index)",
      "Create a clustered hash index on (customer_id, order_date) on the ORDERS table, replacing the default clustered B-tree index on order_id primary key to physically sort all rows by customer and date on disk pages",
      "Create a full-text search index on the customer_id and order_date columns and rewrite the report query to use CONTAINS() and FREETEXT() operators instead of WHERE clause equality and range predicates for improved fuzzy search performance",
    ],
    correctOption: 1,
    explanation:
      "A composite B-tree on (Equality column first: customer_id, then Range: order_date, then GROUP BY column: status, INCLUDE/append aggregated column: total_amount) allows an index-only scan — all data needed for the query exists in the index, no table lookup (bookmark lookup/key lookup). Option 1 creates many indexes with massive write overhead (every insert must update 10 indexes) and the optimizer still must do index intersection, far less efficient than covering index. Option 3 replaces clustered PK hash index which loses range scan on PK (bad for other queries) and hash indexes are terrible for range queries on order_date. Option 4 uses full-text indexes which are for fuzzy string search, not numeric/date filtering.",
  },
  {
    id: "q4-q4",
    quizId: "q4",
    text: "A poorly designed relational database schema for a university stores all data in a single flat table: STUDENT_COURSE_INSTRUCTOR(student_id, student_name, student_major, course_code, course_title, credits, instructor_id, instructor_name, instructor_office). This design causes anomalies: updating an instructors office location requires updating every row where that instructor teaches; adding a newly hired instructor who has not yet been assigned to teach any course is impossible without creating NULLs in student and course columns. Which database normalization process eliminates these insert, update, and delete anomalies through non-loss decomposition, and what is the correct final decomposed schema?",
    options: [
      "First Normal Form (1NF): eliminate multi-valued attributes and repeating groups by ensuring every cell contains only a single atomic value; keep the single table but add surrogate key column row_id PRIMARY KEY",
      "Second Normal Form (2NF): eliminate partial functional dependencies on composite primary keys by creating separate tables: STUDENT(student_id, student_name, student_major) and COURSE_INSTRUCTOR(course_code, course_title, credits, instructor_id, instructor_name, instructor_office)",
      "Boyce-Codd Normal Form (BCNF) / Third Normal Form (3NF): eliminate both partial and transitive functional dependencies by creating three separate tables: STUDENT(student_id PK, student_name, student_major), COURSE(course_code PK, course_title, credits), and INSTRUCTOR(instructor_id PK, instructor_name, instructor_office), with appropriate foreign keys and a junction table ENROLLMENT for the M:N relationship between STUDENT and COURSE, and a 1:N FK from INSTRUCTOR to COURSE",
      "Fourth Normal Form (4NF): eliminate all multi-valued dependencies by creating six separate tables, one per attribute, with each table containing only a single non-key column and reference to the universal composite master key identifier",
    ],
    correctOption: 2,
    explanation:
      "The described anomalies (transitive dependency: course_code → instructor_id → instructor_name/office, plus repeating groups per student/course) require 3NF/BCNF decomposition into entities. Option 1 (1NF) does nothing to fix the described anomalies. Option 2 (2NF only) does not decompose Instructor fields from Course — it still has transitive dependencies and update anomalies (changing office requires editing every course of that instructor). Option 3 (4NF) is excessive; 4NF addresses multi-valued dependencies (e.g., student multiple hobbies) not present here. The canonical fix is Option 3: 3 separate entity tables, no repeating groups, all non-key attributes describe the key, the whole key, and nothing but the key.",
  },
  {
    id: "q4-q5",
    quizId: "q4",
    text: "A database developer writes the following SQL query to list every department name and the full names of all employees assigned to each department, including departments that currently have no employees assigned at all (the result must show departments with NULL employee name columns). Which JOIN type produces this result set correctly? SELECT d.department_name, e.first_name, e.last_name FROM departments d [JOIN TYPE] employees e ON d.department_id = e.department_id ORDER BY d.department_name;",
    options: [
      "INNER JOIN — returns only rows where the join predicate d.department_id = e.department_id matches exactly in both tables, automatically filtering out any departments with zero employees and any employees with NULL department_id values",
      "LEFT OUTER JOIN (LEFT JOIN) — returns all rows from the left table (departments) including unmatched rows where no corresponding employee exists, padding the employee output columns with NULL values for departments with no assigned employees",
      "RIGHT OUTER JOIN (RIGHT JOIN) — returns all rows from the right table (employees) including unmatched employees, but discards departments that have no assigned employees, padding the department output columns with NULL for employees not assigned to any department",
      "FULL OUTER JOIN (FULL JOIN) — returns the mathematical union of both tables including completely unmatched rows from both sides, padding ALL columns with NULL for mismatched rows, including employees not assigned to any department and departments with no employees, plus a Cartesian product cross-join intermediate step",
    ],
    correctOption: 1,
    explanation:
      'We need ALL departments (left table) including those without employees → LEFT OUTER JOIN. Inner Join (Option 1) drops empty departments. Right Join (Option 2) keeps all employees instead of all departments. Full Outer Join (Option 3) additionally preserves employees with no department, which is not desired in this scenario ("including departments that currently have no employees assigned" — no mention of retaining orphan employees). Also the claim about Cartesian cross-join intermediate step in Option 3 is incorrect; FULL JOIN is implemented as union of LEFT + RIGHT, not a cross-join.',
  },
  {
    id: "q4-q6",
    quizId: "q4",
    text: "A software engineering team is choosing a database system for a new IoT product that must write 100,000 sensor readings per second from millions of globally distributed devices. Each device sensor reading has a variable schema (some devices report humidity, others report vibration, others report location GPS coordinates). The team needs to horizontally scale writes linearly by adding more nodes, and strong transactional consistency across geographically distributed data centers is not required. Which database category is the BEST choice?",
    options: [
      "Relational SQL Database (e.g., MySQL, PostgreSQL) with normalized tables DEVICE(device_id PK, ...) and READING(device_id FK, sensor_type, value_float, timestamp) with B-tree indexes on timestamp and device_id, using a single large vertically scaled primary database server with multiple read replicas",
      "Key-Value / Wide-Column NoSQL Database (e.g., Apache Cassandra, Amazon DynamoDB, ScyllaDB) with device_id as partition key and (timestamp, sensor_type) as clustering column, using LSM tree storage engine with tunable per-query consistency levels (ONE/QUORUM/ALL), enabling linear write scalability by adding cluster nodes and flexible schema via collections and dynamic columns",
      "In-Memory Relational Database (e.g., Redis, Memcached) persisting only key-value string pairs via RDB snapshots, with all sensor readings stored as serialized JSON blob strings accessible via GET/PUT commands and no secondary indexing capability",
      "Graph Database (e.g., Neo4j, Amazon Neptune, TigerGraph) storing devices and sensor readings as vertex nodes with timestamp-weighted edges, enabling complex traversal queries across connected sensor devices using the Gremlin or Cypher query languages",
    ],
    correctOption: 1,
    explanation:
      "Cassandra/DynamoDB-style Wide-Column NoSQL handles 100k+ writes/sec with linear horizontal scalability and flexible schema for variable sensor types. SQL (Option 1) cannot achieve that write throughput on a single primary; SQL writes scale vertically poorly. Redis (Option 3) is in-memory, costly for 100k/s long-term storage, limited querying. Graph DB (Option 4) is optimized for relationship traversals, not raw high-throughput time-series sensor ingest. The described requirements (variable schema, write throughput, horizontal scale, no cross-DC strong consistency) are classic NoSQL/Wide-Column use cases.",
  },
  {
    id: "q4-q7",
    quizId: "q4",
    text: "Consider the following keys within an online bookstore relational database schema. Which statement correctly classifies each key type for the BOOK table (columns: isbn, title, author_id, publisher_id, edition, publication_year, price) and the AUTHOR table (columns: author_id, first_name, last_name, date_of_birth, country, email)?",
    options: [
      "BOOK.isbn is a candidate/surrogate key. AUTHOR.author_id is a composite primary key. BOOK.publisher_id is a unique constraint key. The foreign key does not exist between these two tables because BOOK.author_id and AUTHOR.author_id have different column names",
      "BOOK.isbn is the natural primary key (real-world unique identifier for each published book edition). AUTHOR.author_id is a surrogate primary key (arbitrary integer auto-generated ID with no business meaning). BOOK.author_id is a foreign key referencing AUTHOR.author_id, creating a 1:N relationship (one author writes many books, each book has one author record)",
      "BOOK.title is the primary key because it uniquely identifies every book. AUTHOR.first_name combined with AUTHOR.last_name forms a simple primary key. BOOK.author_id is a candidate key eligible for indexing.",
      "Both tables require composite primary keys: BOOK PK = (title, author_id, edition, publication_year) because ISBNs are not universally unique. AUTHOR PK = (first_name, last_name, date_of_birth) to handle authors with identical full names.",
    ],
    correctOption: 1,
    explanation:
      "ISBN is the canonical natural key for books (real-world, universally unique). author_id as auto-incrementing integer is the classic example of a surrogate key. BOOK.author_id FK → AUTHOR.author_id PK creates standard 1:N author-book relationship. Option 1: ISBN is natural not surrogate; author_id is simple not composite; different column names DO NOT prevent FK relationship (FK column name can differ, only values must match). Option 2: Book titles are NOT unique (many books share titles). Option 3 is an anti-pattern: composite PKs add enormous complexity to every join; ISBNs ARE universally unique per book edition by ISO 2108 standard.",
  },

  {
    id: "q5-q1",
    quizId: "q5",
    text: "A serverless data processing pipeline on AWS experiences highly variable request latency. P99 (99th percentile) request duration during off-peak hours is approximately 400 ms, but P99 latency spikes to 4,500 ms immediately after idle periods and at the start of business hours. Which phenomenon causes this latency pattern, and what mitigation strategy provides the MOST effective improvement for latency-sensitive user-facing API endpoints?",
    options: [
      "Eventual Consistency Delay caused by DynamoDB read replicas; mitigate by configuring all DynamoDB queries with ConsistentRead=true and switching the table to Global Tables multi-region replication with synchronous replication across regions",
      "Lambda Cold Start latency caused by initializing a new execution environment (downloading deployment package, initializing the language runtime, executing static initialization code outside the handler) when no warm sandbox is available; mitigate production latency by enabling Lambda Provisioned Concurrency for the specific API-facing function versions/aliases",
      "SQS Queue-based backpressure caused by long polling intervals; mitigate by reducing the SQS ReceiveMessageWaitTimeSeconds parameter from 20 seconds to 0 seconds (short polling) and configuring Lambda batch size to 1 message per invocation to ensure immediate processing",
      "API Gateway throttling at the default account-level burst quota; mitigate by requesting a service quota increase for the account-level burst limit to 100,000 requests per second and implementing exponential backoff with jitter in the client SDK retry logic",
    ],
    correctOption: 1,
    explanation:
      "Cold starts are the exact phenomenon described: idle periods cause Lambda sandboxes to be recycled; new environments take seconds to initialize. Provisioned Concurrency keeps a specified number of execution environments pre-warmed, eliminating cold starts for those provisioned instances. Eventual consistency (Option 1) affects DynamoDB data freshness, not multi-second latency spikes after idle. SQS polling (Option 3) changes throughput behavior not startup latency, reducing to 0 wastes API calls. API Gateway throttling (Option 4) returns HTTP 429 Too Many Requests errors, not latency increases.",
  },
  {
    id: "q5-q2",
    quizId: "q5",
    text: "A serverless REST API is built using Amazon API Gateway forwarding requests to backend AWS Lambda integrations. The architecture requires: (1) authenticating users via short-lived JWT tokens issued by a third-party OAuth 2.0 identity provider (Auth0 / Okta), (2) rate limiting per API key to 1,000 requests/day per user, (3) transforming incoming JSON request bodies by adding a timestamp header before forwarding to Lambda, and (4) mapping Lambda function errors (e.g., ValueError) to standard HTTP 400 Bad Request responses with formatted JSON error bodies. Which combination of API Gateway features correctly implements each requirement in order?",
    options: [
      "All four requirements must be implemented within the Lambda application code itself: JWT validation with a library like python-jose, per-user rate limiting via DynamoDB atomic counters, request body transformation using dict updates, and exception handling with middleware decorators; API Gateway only performs basic HTTP proxy pass-through",
      "(1) JWT Authorizer (COGNITO_USER_POOLS or JWT Authorizer type) with token validation against OAuth provider JWKS endpoint; (2) Usage Plans with API Keys and per-key quota settings of 1,000 requests/day; (3) Mapping Templates or VTL velocity templates in the Integration Request section to modify request body/headers before Lambda invocation; (4) Method Response + Integration Response status code mappings with selection patterns matching Lambda error message strings",
      "(1) Lambda Custom Authorizer (REQUEST authorizer) that calls back to the identity provider on every request for synchronous validation; (2) Stage-level throttling Burst=1000, Rate=1000; (3) Lambda@Edge viewer request trigger for transformation; (4) Lambda Destination asynchronous invocation configuration with failure destination to SQS DLQ",
      "(1) Mutual TLS (mTLS) authentication with client certificate validation; (2) WAFv2 Rate-Based Rule Statement with rate limit 1000 per 5-minute period; (3) CloudFront Functions viewer response event; (4) Step Functions with Catch/Retry states for all Lambda errors",
    ],
    correctOption: 1,
    explanation:
      "API Gateway has native features for all four in the described order: JWT Authorizer (natively validates JWT against JWKS), Usage Plans (per API key daily/monthly quotas), Integration Request Mapping Templates (transforms requests via VTL pre-Lambda), Integration Response patterns (matches Lambda error strings → HTTP codes). Option 1 pushes everything to Lambda which negates API Gateway capabilities. Option 3: Custom REQUEST authorizer for JWT is wasteful vs built-in JWT authorizer; stage throttling is global not per user. Option 4: mTLS is certificate-based not JWT-based, WAF rate rule is global per IP not per user key.",
  },
  {
    id: "q5-q3",
    quizId: "q5",
    text: "A ride-sharing application processes 50,000 ride-completed events per minute. The system architecture requires that each completed ride event triggers three independent downstream consumers: (1) an invoicing service that calculates the final ride fare and generates a PDF receipt; (2) a driver analytics service that updates driver aggregate rating and trip history statistics; (3) a marketing promotions service that determines if the rider qualifies for a personalized discount coupon on their next ride. If the marketing service experiences a 30-minute outage, all ride events must be reliably replayed from the outage start without duplication or data loss once the service recovers. Which architectural pattern using AWS services BEST meets these decoupling and reliability requirements?",
    options: [
      "Point-to-point direct Lambda invocation: the ride completion Lambda directly and synchronously invokes the three downstream service Lambda functions using boto3 lambda.invoke() calls with InvocationType=RequestResponse, implementing a try/catch retry loop within the source Lambda for each downstream call",
      "Amazon Simple Notification Service (SNS) FIFO Topic with SQS Standard Queue subscriber fan-out pattern: publish each event once to the SNS FIFO topic; subscribe three separate SQS standard queues (invoice-queue, analytics-queue, promo-queue) to the SNS topic; configure each consumer Lambda with an SQS event source mapping from its dedicated queue, leveraging SQS visibility timeouts and dead-letter queues for retries",
      "Amazon Simple Queue Service (SQS) FIFO single queue with message fan-out: publish each ride event once with a MessageGroupId per consumer; each of the three Lambda consumers polls the same FIFO queue and uses message attribute filtering to pull only events intended for their specific consumer type",
      "Amazon EventBridge (CloudWatch Events) default event bus with PutEvents API: publish all events to the default bus and configure three EventBridge rules with identical event patterns routing each event to all three Lambda consumers; disable retry policies and configure EventBridge to drop events that fail delivery after 30 minutes",
    ],
    correctOption: 1,
    explanation:
      "SNS Topic → multiple SQS queues = Pub/Sub fan-out pattern for independent, decoupled consumers with durable message retention. SQS queues store messages during consumer outage for later replay (visibility timeout + dead-letter queues). Option 1 direct invocation = tight coupling and synchronous calls; if any consumer fails the source fails. Option 3 single FIFO queue cannot do true fan-out; multiple consumers on same queue compete for messages. Option 4 has 24h max retry limit but default bus rules do not provide durable persistent queues for long outage replay; SQS explicitly supports 14-day retention for disaster recovery scenarios.",
  },
  {
    id: "q5-q4",
    quizId: "q5",
    text: "An e-commerce platform uses Amazon DynamoDB to store shopping cart data. The business introduces a new tax compliance feature requiring that whenever a cart item price changes or an item is added/removed, the old item state must be captured and asynchronously delivered to an audit system for 7-year immutable archiving. The solution must not introduce additional latency or coupling to the existing DynamoDB cart update API path, and must capture every single item-level change including changes made by direct console access or batch write operations. Which approach satisfies all requirements?",
    options: [
      "Modify the application Lambda code that writes to DynamoDB such that before each PutItem / UpdateItem / DeleteItem call, the Lambda reads the existing item state using GetItem, then explicitly publishes both the before and after images to an Amazon SNS audit topic using boto3, catching and suppressing any SNS publish failures to avoid blocking the user API call",
      "Enable DynamoDB Streams on the shopping cart table with StreamViewType set to NEW_AND_OLD_IMAGES; configure the stream as an event source for a new Lambda function that reads the stream records containing before/after item images on per-shard polling cadence, which asynchronously publishes change events to the audit archiving system with automatic retries on Lambda failure",
      "Create a new Global Secondary Index (GSI) on the shopping cart table with projected attributes KEYS_ONLY, and configure DynamoDB Accelerator (DAX) write-through caching; the audit system periodically scans the GSI for recent changes using Scan operations with an IndexName parameter and a time-to-live (TTL) filter attribute",
      "Configure DynamoDB Point-in-Time Recovery (PITR) with 35-day continuous backup window on the source table; schedule an hourly AWS Lambda function that uses the PITR RestoreTableToPointInTime API to create a full restored clone of the cart table, then performs a full table data diff comparison using AWS Glue ETL jobs between the live table and the restored snapshot table",
    ],
    correctOption: 1,
    explanation:
      "DynamoDB Streams is the native Change Data Capture (CDC) mechanism: captures ALL table changes (regardless of source: API/batch/console), provides NEW_AND_OLD_IMAGES, adds zero write latency to the critical path (changes pushed asynchronously), invokes Lambda via stream event source. Option 1: modifying application code is error-prone; it cannot capture console or batch writes; suppressing SNS errors risks data loss. Option 3: GSI + DAX is a read optimization, NOT change capture. Option 4: PITR restore + hourly Glue diffs is massively expensive, complex, and has 1-hour latency, not real-time CDC.",
  },
  {
    id: "q5-q5",
    quizId: "q5",
    text: "A DevOps team needs to execute a long-running (approximately 90-minute duration) proprietary batch data processing job once nightly using containerized workload packaging. The Docker image requires custom system libraries, runs as root with specific Linux capabilities, and is completely stateless. The team wants to avoid managing EC2 instances entirely (no SSH access, no patching, no auto-scaling group configuration). Which AWS compute option should be selected and why?",
    options: [
      "AWS Lambda with Lambda Container Image Support (package Docker image in ECR) and provisioned concurrency of 1 set permanently to eliminate cold starts; Lambda automatically scales the execution duration limit to 90 minutes when using container deployments",
      "AWS Fargate launch type for Amazon Elastic Container Service (ECS) scheduled tasks, configured with an EventBridge (CloudWatch Events) cron schedule rule to invoke the Fargate task once nightly; Fargate is serverless containers with no EC2 management, supports up to 14 GB RAM / 4 vCPUs per task, runs arbitrary Docker images with custom user permissions and Linux capabilities via task definition flags, and has no per-task execution time limit (only ECS stop timeout)",
      "AWS Lambda Layers with a custom runtime packaged together with the batch dependencies as a shared Lambda layer used by multiple functions, invoked via SQS long polling triggered by a scheduled CloudWatch alarm that fires a Step Functions standard workflow",
      "Amazon ECS with EC2 launch type, using cluster auto-scaling with minimum 0 and maximum 1 EC2 instance; create an ECS service with desired count set to 0, and use an AWS Systems Manager Automation runbook document that starts a new instance and sets desired count to 1 each night before terminating the instance in the morning",
    ],
    correctOption: 1,
    explanation:
      'Fargate runs arbitrary containers serverlessly: no instance management. Lambda cannot be used for 90-minute jobs; its hard execution limit is 15 minutes regardless of container image packaging. Option 1 and 3 (Lambda-based) fail due to duration constraints. Option 4 (ECS EC2 launch type with ASG) requires managing EC2 instances (the team explicitly wants NO instance management) — they specifically stated "avoid managing EC2 instances entirely". Fargate is the correct answer for containerized long-duration workloads requiring no instance management.',
  },
  {
    id: "q5-q6",
    quizId: "q5",
    text: "A university is evaluating serverless architecture for its new Learning Management System assignment submission module. Which of the following represents a SIGNIFICANT CAVEAT / DISADVANTAGE of adopting a pure serverless approach compared to traditional container-based deployments on managed Kubernetes or virtual machines?",
    options: [
      "Predictable fixed-cost billing is impossible with serverless — compute costs scale linearly with invocations making it impossible to forecast monthly cloud expenditure, even with steady-state workloads of consistent request volume over time",
      "Execution environment limitations: hard per-invocation time limits (Lambda 15 min), maximum ephemeral storage (/tmp) capacity (10 GB default Lambda), limited process control (no background threads/processes surviving past handler return), no long-lived persistent TCP connections (cold start penalty every re-connect), and platform-imposed CPU/RAM ratio constraints",
      "Serverless functions cannot be version-controlled or tested locally — every code change must be deployed directly to the cloud provider environment, and unit tests cannot be written without executing against live cloud resources, slowing development velocity significantly",
      "Serverless scaling is significantly worse than traditional deployments: Lambda functions require manual configuration of desired auto-scaling count with slow linear ramp-up speed (1 new container per minute) and no burst capacity capability, making it incapable of handling flash traffic events without 24-48 hours of pre-provisioning requests",
    ],
    correctOption: 1,
    explanation:
      "Lambda and similar FaaS platforms impose real hard limits: 15-minute max duration, /tmp storage cap, no background processes, ephemeral state. These make it unsuitable for certain workloads (long batch, WebSocket servers, game servers with stateful connections). Cost (Option 1) IS predictable for steady-state via Savings Plans/Provisioned Concurrency pricing. Option 3 wrong: SAM CLI, Serverless Framework, LocalStack, and unit testing libraries exist — local dev/test is standard. Option 4 is completely wrong: Lambda burst concurrency is hundreds per region automatically, scales thousands within minutes without manual config.",
  },
  {
    id: "q5-q7",
    quizId: "q5",
    text: "When comparing the messaging semantics of Amazon Simple Queue Service (SQS) and Amazon Simple Notification Service (SNS), which statement accurately describes their core delivery model differences and typical production use cases in event-driven serverless architectures?",
    options: [
      "SQS is a pub/sub push-based delivery service that broadcasts every message to ALL subscribed endpoints in parallel including Lambda, SQS, HTTP, SMS, and email. SNS is a pull-based queueing service where a single consumer polls and processes messages one-by-one, guaranteeing exactly-once processing per queue.",
      "SNS is pub/sub push-based: published messages are immediately pushed to all subscribed endpoints in parallel (fan-out) with SQS, Lambda, HTTP/S, email, SMS delivery protocols; suitable when multiple independent consumers must each receive a copy of the event. SQS is pull-based point-to-point queue: consumers poll the queue and compete for messages (one consumer receives each message); suitable for buffering/decoupling work and enabling horizontal consumer scaling with retry/DLQ handling",
      "Both SNS and SQS are pull-based queueing services with identical semantics. The only functional difference is throughput: SQS supports 1,000 messages per second per queue while SNS supports 30,000 messages per second per topic. SNS should always be preferred in high-throughput scenarios.",
      "SQS supports both pub/sub and point-to-point patterns on a single resource using message attribute filtering. SNS is a dead-letter queue service used exclusively to capture messages that repeatedly fail processing in other messaging services, and cannot deliver messages to Lambda functions directly.",
    ],
    correctOption: 1,
    explanation:
      "SNS = fan-out push delivery to many subscribers (1 message → N copies → N consumers). SQS = competing consumers pull-based queue (1 message → 1 consumer picks it up). Option 1 swaps definitions entirely. Option 3 makes false throughput equivalence claim and denies semantic differences. Option 4 incorrectly makes SQS support pub/sub and casts SNS as DLQ-only; neither is true (SNS is primary pub/sub; DLQ is a configuration on SQS/SNS).",
  },
  {
    id: "q5-q8",
    quizId: "q5",
    text: "A serverless workflow orchestrates a complex five-step order processing pipeline: (1) validate customer payment with a third-party Stripe API call (5 second timeout); (2) reserve inventory in DynamoDB (idempotent); (3) call a legacy on-premises ERP SOAP web service via AWS Direct Connect (slow, unreliable, 2-minute timeout, requires custom retry logic with exponential backoff up to 3 attempts); (4) generate a PDF invoice via a Lambda function (CPU-intensive, typically 45 seconds); (5) send a transactional email via Amazon SES. The business requires that if step (3) ERP call permanently fails after 3 retries, the inventory reservation (step 2) is automatically rolled back and a failure email is sent, while any other step failure should alert operations without automatic rollback. Which orchestration approach is MOST appropriate?",
    options: [
      "Chain Lambda functions directly with SNS: each Lambda publishes completion to an SNS topic triggering the next Lambda; implement rollback logic as a separate error handling Lambda subscribed to a DLQ topic; configure retry behavior in the Lambda function code using environment variables",
      "AWS Step Functions Standard Workflow with a state machine definition using Pass, Task, Parallel, Map, Catch, and Wait states: each step is a Task state invoking the appropriate Lambda; the ERP Task state has a custom Retry block with IntervalSeconds=5, BackoffRate=2.0, MaxAttempts=3; a Catch state on that specific Task transitions to an SQS send message + inventory release Lambda Task for compensating transaction rollback, while other Task states have generic Catch → SNS publish failure alert",
      "AWS Batch with multi-stage job queues: create 5 separate Batch job definitions, configure job dependsOn relationships, attach a Step Functions Express Workflow listener on AWS Batch job state change events via Amazon EventBridge, and implement compensation by running a second parallel Batch job pipeline on failure states",
      "A single monolithic Lambda function implementing all 5 steps sequentially in a Python script using for loops and try/except blocks, with manual sleep() calls for retry backoff, running with a configured timeout of 15 minutes, and manually invoking another Lambda function to undo the reservation when catching exceptions at step 3",
    ],
    correctOption: 1,
    explanation:
      'AWS Step Functions is designed exactly for this: declarative state machines with built-in Retry/Catch (per-state granularity), human-readable visual workflows, long-running durable executions (up to 1 year), and compensating transactions via Catch states. Option 1 (SNS Lambda chaining) is the "do-it-yourself" anti-pattern: you must implement state management, retries, catch, rollback, dead-lettering, monitoring — all the things Step Functions gives you natively. Option 3 (AWS Batch) is for container batch jobs, not orchestrating 5 tiny steps. Option 4 (monolithic Lambda) is brittle: no visual state monitoring, no built-in per-step retries separate from each other, 15-minute limit, no state persistence on crash (if Lambda dies mid-execution inventory is stuck reserved).',
  },
];

export const mockQuizAttempts: QuizAttempt[] = [
  {
    id: "a1",
    userId: "u1",
    quizId: "q1",
    answers: {
      "q1-q1": 1,
      "q1-q2": 3,
      "q1-q3": 1,
      "q1-q4": 1,
      "q1-q5": 0,
      "q1-q6": 1,
      "q1-q7": 1,
      "q1-q8": 2,
    },
    score: 18,
    total: 20,
    percentage: 90,
    timeTakenSecs: 1458,
    status: "completed",
    submittedAt: "2026-09-30T13:25:00.000Z",
  },
  {
    id: "a2",
    userId: "u1",
    quizId: "q2",
    answers: {
      "q2-q1": 2,
      "q2-q2": 2,
      "q2-q3": 3,
      "q2-q4": 0,
      "q2-q5": 1,
      "q2-q6": 1,
      "q2-q7": 1,
      "q2-q8": 1,
    },
    score: 14,
    total: 15,
    percentage: 93,
    timeTakenSecs: 1230,
    status: "completed",
    submittedAt: "2026-09-27T11:40:00.000Z",
  },
  {
    id: "a3",
    userId: "u1",
    quizId: "q3",
    answers: {
      "q3-q1": 0,
      "q3-q2": 1,
      "q3-q3": 0,
      "q3-q4": 1,
      "q3-q5": 1,
      "q3-q6": 0,
      "q3-q7": 0,
    },
    score: 17,
    total: 21,
    percentage: 81,
    timeTakenSecs: 1845,
    status: "completed",
    submittedAt: "2026-09-15T15:12:00.000Z",
  },
  {
    id: "a4",
    userId: "u1",
    quizId: "q4",
    answers: {
      "q4-q1": 2,
      "q4-q2": 0,
      "q4-q3": 1,
      "q4-q4": 2,
      "q4-q5": 1,
      "q4-q6": 1,
      "q4-q7": 1,
    },
    score: 11,
    total: 14,
    percentage: 79,
    timeTakenSecs: 1620,
    status: "completed",
    submittedAt: "2026-09-20T09:58:00.000Z",
  },
];
