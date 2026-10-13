import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from root edu-connect folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'educonnect',
};

const coursesData = [
  {
    title: "Python Programming Crash Course",
    category: "Programming",
    level: "Beginner",
    duration: "8 Hours",
    description: JSON.stringify({
      category: "Programming",
      level: "Beginner",
      duration: "8 Hours",
      overview: "Learn Python from scratch by building a strong programming foundation.",
      prerequisites: "No prior programming experience required.",
      outcomes: [
        "Write Python programs confidently",
        "Understand functions and data structures",
        "Work with files and error handling",
        "Build real-world automation scripts"
      ]
    }),
    modules: [
      { title: "Introduction to Python", content: "Overview of Python syntax, history, and why Python is popular for software engineering and data science." },
      { title: "Installing Python & VS Code", content: "Setting up Python 3 runtime, VS Code extensions, terminal setup, and writing your first script." },
      { title: "Variables & Data Types", content: "Working with integers, floats, strings, booleans, type casting, and dynamic typing in Python." },
      { title: "Operators in Python", content: "Arithmetic, comparison, logical, assignment, and bitwise operators with practical examples." },
      { title: "Conditional Statements", content: "If, elif, else control flow, nested conditions, and ternary operators." },
      { title: "Loops in Python", content: "For loops, while loops, range() function, break, continue, and pass statements." },
      { title: "Functions & Scope", content: "Defining functions, parameters, return values, positional vs keyword arguments, and lambda functions." },
      { title: "Lists, Tuples & Dictionaries", content: "Deep dive into Python data structures: mutability, indexing, slicing, dictionary methods, and sets." },
      { title: "File Handling", content: "Reading and writing files (.txt, .json, .csv), using context managers (`with` open)." },
      { title: "Mini Project - Contact Book Manager", content: "Build a complete CLI project that creates, reads, updates, and deletes contact records saved in files." }
    ]
  },
  {
    title: "Java Programming",
    category: "Programming",
    level: "Beginner",
    duration: "10 Hours",
    description: JSON.stringify({
      category: "Programming",
      level: "Beginner",
      duration: "10 Hours",
      overview: "Master object-oriented programming with Java for enterprise software development.",
      prerequisites: "Basic computer knowledge.",
      outcomes: [
        "Master Java syntax and OOP principles",
        "Handle exceptions and data collections",
        "Build modular Java desktop and backend applications"
      ]
    }),
    modules: [
      { title: "Java Basics & JVM Architecture", content: "Understanding JDK, JRE, JVM, compilation process, and class structure." },
      { title: "Variables & Data Types", content: "Primitive types, reference types, scope, and memory allocation." },
      { title: "Operators & Control Flow", content: "Arithmetic, conditional logic, switch statements, and loop constructs." },
      { title: "OOP Concepts - Encapsulation & Abstraction", content: "Classes, objects, private fields, getters, setters, and abstract classes." },
      { title: "OOP Concepts - Inheritance & Polymorphism", content: "Superclass, subclass, method overriding, overloading, and interfaces." },
      { title: "Arrays & String Handling", content: "1D/2D arrays, String immutability, StringBuilder, and StringBuffer." },
      { title: "Exception Handling", content: "Try-catch blocks, throw, throws, custom exceptions, and resource management." },
      { title: "Java Collections Framework", content: "List, ArrayList, LinkedList, Set, HashSet, Map, and HashMap." },
      { title: "File I/O Streams", content: "FileReader, FileWriter, BufferedReader, and Serialization." },
      { title: "Mini Project - Student Grade System", content: "Create an OOP Java console application to process and display student performance records." }
    ]
  },
  {
    title: "C Programming",
    category: "Programming",
    level: "Beginner",
    duration: "6 Hours",
    description: JSON.stringify({
      category: "Programming",
      level: "Beginner",
      duration: "6 Hours",
      overview: "Build a foundational understanding of low-level memory management and core programming concepts.",
      prerequisites: "None.",
      outcomes: [
        "Understand memory structures and pointers",
        "Write modular C code with functions and structs",
        "Develop algorithmic problem-solving skills"
      ]
    }),
    modules: [
      { title: "Introduction to C", content: "Structure of C program, main function, headers, GCC compiler." },
      { title: "Variables & Data Types", content: "int, float, char, double, qualifiers, and storage classes." },
      { title: "Operators & Expressions", content: "Arithmetic, relational, bitwise, and precedence rules." },
      { title: "Loops & Decision Making", content: "if-else, switch, while, do-while, and for loops." },
      { title: "Functions & Recursion", content: "Function declarations, call by value, call by reference, recursive functions." },
      { title: "Arrays & Strings", content: "1D/2D arrays, string functions (strcpy, strcmp, strlen)." },
      { title: "Pointers & Memory", content: "Pointer arithmetic, dereferencing, dynamic memory allocation (malloc, calloc, free)." },
      { title: "Structures & Unions", content: "Creating custom data types with struct, typedef, and union memory sharing." },
      { title: "File Operations", content: "fopen, fclose, fprintf, fscanf, binary file reads." },
      { title: "Mini Project - Bank Account System", content: "Construct a C program managing balance deposits, withdrawals, and account logs." }
    ]
  },
  {
    title: "C++ Programming",
    category: "Programming",
    level: "Intermediate",
    duration: "8 Hours",
    description: JSON.stringify({
      category: "Programming",
      level: "Intermediate",
      duration: "8 Hours",
      overview: "Explore high-performance computing with C++ Object-Oriented Programming and Standard Template Library (STL).",
      prerequisites: "Basic understanding of C or programming logic.",
      outcomes: [
        "Implement advanced Object-Oriented software design",
        "Master modern C++ Standard Template Library (STL)",
        "Optimize algorithms for maximum execution speed"
      ]
    }),
    modules: [
      { title: "C++ Basics & Syntax", content: "std::cout, std::cin, namespaces, header files, and compilation." },
      { title: "Variables, References & Pointers", content: "Reference variables (&), pointers, smart pointers (unique_ptr, shared_ptr)." },
      { title: "OOP Principles in C++", content: "Classes, objects, public/private/protected access modifiers." },
      { title: "Constructors & Destructors", content: "Default, parameterized, copy constructors, RAII pattern." },
      { title: "Inheritance & Multiple Inheritance", content: "Base and derived classes, virtual base classes." },
      { title: "Polymorphism & Virtual Functions", content: "Function overriding, vtables, pure virtual functions, interface classes." },
      { title: "Standard Template Library (STL)", content: "Vectors, Lists, Deques, Maps, Sets, Iterators, and Algorithms." },
      { title: "File Handling & Streams", content: "fstream, ifstream, ofstream binary & text processing." },
      { title: "Templates & Generic Programming", content: "Function templates and Class templates." },
      { title: "Mini Project - Inventory Management System", content: "Develop a C++ application utilizing STL containers and file persistence." }
    ]
  },
  {
    title: "Data Structures & Algorithms",
    category: "Computer Science",
    level: "Intermediate",
    duration: "12 Hours",
    description: JSON.stringify({
      category: "Computer Science",
      level: "Intermediate",
      duration: "12 Hours",
      overview: "Master fundamental data structures and algorithmic techniques for technical interview preparation.",
      prerequisites: "Knowledge of any programming language (Python, Java, C++).",
      outcomes: [
        "Analyze time and space complexity with Big-O notation",
        "Implement Arrays, Linked Lists, Trees, Graphs, and Heaps",
        "Apply Dynamic Programming and Sorting algorithms"
      ]
    }),
    modules: [
      { title: "Complexity Analysis & Big-O", content: "Time complexity, space complexity, asymptotic notation (O, Ω, Θ)." },
      { title: "Arrays & String Algorithms", content: "Two-pointer technique, sliding window, prefix sums." },
      { title: "Linked Lists", content: "Singly, doubly, circular linked lists, fast & slow pointers." },
      { title: "Stacks & Queues", content: "LIFO, FIFO, Monotonic stacks, Priority Queues." },
      { title: "Trees & Binary Search Trees (BST)", content: "Tree traversals (Inorder, Preorder, Postorder, BFS), BST operations." },
      { title: "Graphs & Traversal", content: "Adjacency matrix/list, Breadth-First Search (BFS), Depth-First Search (DFS)." },
      { title: "Searching Algorithms", content: "Linear Search, Binary Search, Search in Rotated Sorted Array." },
      { title: "Sorting Algorithms", content: "Bubble, Selection, Insertion, Merge Sort, Quick Sort." },
      { title: "Dynamic Programming", content: "Memoization vs Tabulation, Fibonacci, Knapsack, Longest Common Subsequence." },
      { title: "Mini Project - Pathfinding Visualizer", content: "Solve grid navigation problems using BFS and Dijkstra algorithms." }
    ]
  },
  {
    title: "Web Development",
    category: "Full Stack",
    level: "Beginner",
    duration: "10 Hours",
    description: JSON.stringify({
      category: "Full Stack",
      level: "Beginner",
      duration: "10 Hours",
      overview: "Build responsive, modern websites using HTML5, CSS3, JavaScript, and Git.",
      prerequisites: "No experience required.",
      outcomes: [
        "Structure web pages with semantic HTML5",
        "Style layouts with CSS Flexbox & CSS Grid",
        "Add interactive features with modern JavaScript (ES6+)"
      ]
    }),
    modules: [
      { title: "HTML5 Semantic Structure", content: "Headings, paragraphs, forms, inputs, tables, media tags, semantic elements." },
      { title: "CSS3 Fundamentals & Box Model", content: "Selectors, colors, typography, margins, padding, borders, display property." },
      { title: "Modern Layouts - Flexbox & Grid", content: "Building responsive grids, media queries, flex containers." },
      { title: "Bootstrap & CSS Utilities", content: "Rapid UI layout building with Bootstrap grid and component utilities." },
      { title: "JavaScript Essentials (ES6+)", content: "Variables (let/const), arrow functions, template literals, destructuring, array methods." },
      { title: "DOM Manipulation & Events", content: "document.querySelector, addEventListener, dynamic HTML generation." },
      { title: "Responsive Web Design Patterns", content: "Mobile-first development, fluid sizing, viewport meta tags." },
      { title: "Version Control with Git", content: "git init, commit, push, GitHub repo setup." },
      { title: "Web Deployment", content: "Deploying static sites on GitHub Pages, Vercel, or Netlify." },
      { title: "Mini Project - Personal Portfolio Website", content: "Design and publish a fully responsive developer portfolio site." }
    ]
  },
  {
    title: "React.js",
    category: "Frontend",
    level: "Intermediate",
    duration: "8 Hours",
    description: JSON.stringify({
      category: "Frontend",
      level: "Intermediate",
      duration: "8 Hours",
      overview: "Build interactive, component-driven web applications using React 18, Hooks, and State Management.",
      prerequisites: "HTML, CSS, and JavaScript ES6.",
      outcomes: [
        "Master React component architecture",
        "Use React Hooks (useState, useEffect, useContext)",
        "Build single-page apps with routing and API integration"
      ]
    }),
    modules: [
      { title: "React Basics & Virtual DOM", content: "Component architecture, Virtual DOM diffing algorithm, Vite tooling." },
      { title: "JSX & Component Design", content: "Functional components, JSX syntax rules, nested components." },
      { title: "Props & Component Communication", content: "Passing props, default props, prop drilling, children prop." },
      { title: "State Management with useState", content: "Component state, immutability, handling inputs, lists, keys." },
      { title: "Side Effects with useEffect", content: "Lifecycle hooks, dependencies array, cleanup functions, fetching data." },
      { title: "Custom Hooks", content: "Encapsulating reusable component logic into custom React hooks." },
      { title: "React Router", content: "Client-side routing, BrowserRouter, Routes, Route, Link, useParams." },
      { title: "API Integration with Fetch/Axios", content: "Async/await API calls, loading states, error boundary patterns." },
      { title: "Global State with Context API", content: "createContext, useContext, avoiding deep prop drilling." },
      { title: "Mini Project - E-Commerce Shopping App", content: "Build a full-featured cart app with filterable catalog and checkout state." }
    ]
  },
  {
    title: "Node.js & Express",
    category: "Backend",
    level: "Intermediate",
    duration: "9 Hours",
    description: JSON.stringify({
      category: "Backend",
      level: "Intermediate",
      duration: "9 Hours",
      overview: "Develop scalable backend REST APIs, authentication services, and database connectors with Node.js.",
      prerequisites: "JavaScript fundamentals.",
      outcomes: [
        "Build asynchronous event-driven Node.js servers",
        "Create RESTful web APIs with Express",
        "Implement JWT security and database integrations"
      ]
    }),
    modules: [
      { title: "Node.js Architecture", content: "V8 engine, Event Loop, Non-blocking I/O, CommonJS vs ES Modules." },
      { title: "Package Management with npm", content: "package.json, semantic versioning, global vs local packages." },
      { title: "Express Framework Fundamentals", content: "Setting up server, routing methods (GET, POST, PUT, DELETE)." },
      { title: "Express Middleware", content: "Built-in, custom, third-party middleware (cors, morgan, express.json)." },
      { title: "Database Connection", content: "Connecting Express to MySQL or MongoDB with connection pools." },
      { title: "Authentication & JWT", content: "Bcrypt password hashing, JSON Web Tokens (JWT), auth middleware." },
      { title: "REST API Best Practices", content: "HTTP status codes, standard JSON response structures, input validation." },
      { title: "Error Handling", content: "Global error handler, custom error classes, async handlers." },
      { title: "API Deployment", content: "Environment variables, PM2 process manager, Cloud deployment." },
      { title: "Mini Project - Full Stack Task Manager API", content: "Create a secured REST API for managing task workflows." }
    ]
  },
  {
    title: "Flutter Development",
    category: "Mobile",
    level: "Intermediate",
    duration: "10 Hours",
    description: JSON.stringify({
      category: "Mobile",
      level: "Intermediate",
      duration: "10 Hours",
      overview: "Build cross-platform iOS and Android mobile applications from a single Dart codebase.",
      prerequisites: "Object-oriented programming concepts.",
      outcomes: [
        "Master Dart language syntax",
        "Design expressive UIs using Flutter Widget tree",
        "Manage app state and integrate REST APIs"
      ]
    }),
    modules: [
      { title: "Dart Fundamentals", content: "Variables, functions, OOP classes, null safety, async/await." },
      { title: "Flutter SDK & Setup", content: "Flutter architecture, Android Studio / VS Code configuration." },
      { title: "Widgets & Layout Basics", content: "StatelessWidget, StatefulWidget, Container, Row, Column, Stack." },
      { title: "Navigation & Routing", content: "Navigator 1.0/2.0, named routes, passing arguments between screens." },
      { title: "State Management (Provider/Bloc)", content: "Managing reactive app state efficiently across screens." },
      { title: "API Integration & JSON Parsing", content: "http package, model classes, handling async data." },
      { title: "Firebase Integration", content: "Firebase Auth, Cloud Firestore database read/write." },
      { title: "Local Storage", content: "SharedPreferences, Hive database for persistent device storage." },
      { title: "Publishing Mobile Apps", content: "Building APKs, App Bundles, App Store submission overview." },
      { title: "Mini Project - Weather Forecast App", content: "Develop a multi-screen weather application fetching live API data." }
    ]
  },
  {
    title: "Android Development",
    category: "Mobile",
    level: "Intermediate",
    duration: "10 Hours",
    description: JSON.stringify({
      category: "Mobile",
      level: "Intermediate",
      duration: "10 Hours",
      overview: "Build modern native Android mobile applications using Kotlin and Jetpack libraries.",
      prerequisites: "Object-oriented programming knowledge.",
      outcomes: [
        "Develop native Android apps with Kotlin",
        "Use RecyclerView, Activities, and Fragments",
        "Integrate SQLite / Room database and APIs"
      ]
    }),
    modules: [
      { title: "Android Studio & Environment", content: "Setting up IDE, Gradle build system, Android Emulator." },
      { title: "Kotlin Programming Language", content: "Kotlin syntax, null safety, extension functions, coroutines." },
      { title: "Activities & App Lifecycle", content: "Activity states, Intents, Fragment lifecycle, Bundle data transfer." },
      { title: "UI Design with XML & Jetpack Compose", content: "Layouts, TextView, EditText, Button, ConstraintLayout." },
      { title: "Dynamic Lists with RecyclerView", content: "Adapter pattern, ViewHolder pattern, item click listeners." },
      { title: "Room Local Database", content: "Entities, DAOs, RoomDatabase, LiveData / Flow observation." },
      { title: "Network Calls with Retrofit", content: "REST API requests, GSON converter, handling network responses." },
      { title: "Firebase Cloud Services", content: "Firebase Auth, Realtime Database, Push Notifications." },
      { title: "Testing & Debugging", content: "Logcat debugging, JUnit unit tests, Espresso UI testing." },
      { title: "Mini Project - Note Taking Native App", content: "Create a full Kotlin note application with SQLite database persistence." }
    ]
  },
  {
    title: "Artificial Intelligence Fundamentals",
    category: "AI & ML",
    level: "Beginner",
    duration: "8 Hours",
    description: JSON.stringify({
      category: "AI & ML",
      level: "Beginner",
      duration: "8 Hours",
      overview: "Understand foundational AI concepts, search strategies, knowledge representation, and ethics.",
      prerequisites: "Basic high school mathematics and logic.",
      outcomes: [
        "Grasp intelligent agent models and search heuristics",
        "Understand expert systems and neural network foundations",
        "Evaluate AI ethics and societal implications"
      ]
    }),
    modules: [
      { title: "AI Introduction & History", content: "Definition of AI, Turing Test, Symbolic AI vs Data-driven AI." },
      { title: "AI Applications in Industry", content: "Computer Vision, NLP, Robotics, Autonomous Vehicles." },
      { title: "Intelligent Agents", content: "Agent architecture, PEAS descriptors, environment types." },
      { title: "Search Algorithms", content: "Uninformed (BFS, DFS) vs Informed Search (A* Search, Heuristics)." },
      { title: "Knowledge Representation", content: "Propositional Logic, First-Order Logic, Knowledge Graphs." },
      { title: "Expert Systems & Rule Engines", content: "Inference engines, forward vs backward chaining." },
      { title: "Neural Networks Overview", content: "Perceptrons, activation functions, biological vs artificial neurons." },
      { title: "Ethics & Responsible AI", content: "Bias, fairness, transparency, privacy, AI safety." },
      { title: "AI Ecosystem & Tools", content: "Python AI libraries, OpenAI API, HuggingFace tools." },
      { title: "Mini Project - AI Path Search Simulator", content: "Implement A* algorithm to solve a maze pathfinding problem." }
    ]
  },
  {
    title: "Machine Learning",
    category: "AI & ML",
    level: "Intermediate",
    duration: "10 Hours",
    description: JSON.stringify({
      category: "AI & ML",
      level: "Intermediate",
      duration: "10 Hours",
      overview: "Build predictive models with Supervised and Unsupervised Machine Learning using Scikit-Learn.",
      prerequisites: "Python and basic linear algebra/statistics.",
      outcomes: [
        "Preprocess data and perform feature engineering",
        "Train regression, classification, and clustering models",
        "Evaluate model performance and deploy ML APIs"
      ]
    }),
    modules: [
      { title: "Machine Learning Overview", content: "Supervised, Unsupervised, Reinforcement Learning paradigms." },
      { title: "Data Preprocessing & Cleaning", content: "Handling missing values, scaling (StandardScaler), encoding categorical variables." },
      { title: "Regression Algorithms", content: "Linear Regression, Polynomial Regression, Ridge & Lasso regularization." },
      { title: "Classification Algorithms", content: "Logistic Regression, Decision Trees, Random Forest, SVM." },
      { title: "Clustering & Unsupervised Learning", content: "K-Means Clustering, Hierarchical Clustering, PCA dimension reduction." },
      { title: "Model Evaluation Metrics", content: "Confusion matrix, Precision, Recall, F1-score, ROC-AUC, Mean Squared Error." },
      { title: "Feature Engineering", content: "Feature selection, polynomial features, correlation analysis." },
      { title: "Scikit-Learn Pipelines", content: "Building clean ML pipelines, cross-validation, GridSearchCV hyperparameter tuning." },
      { title: "Model Serialization & API Deployment", content: "Pickle/Joblib export, serving predictions via Fastify/Flask API." },
      { title: "Mini Project - Customer Churn Predictor", content: "Train, evaluate, and deploy a machine learning classification model." }
    ]
  },
  {
    title: "Deep Learning",
    category: "AI & ML",
    level: "Advanced",
    duration: "12 Hours",
    description: JSON.stringify({
      category: "AI & ML",
      level: "Advanced",
      duration: "12 Hours",
      overview: "Master Neural Networks, Convolutional Nets, and Sequence models using PyTorch & TensorFlow.",
      prerequisites: "Python and Machine Learning basics.",
      outcomes: [
        "Design deep neural network architectures",
        "Implement Computer Vision models (CNNs)",
        "Train Natural Language Processing models (RNNs/LSTMs)"
      ]
    }),
    modules: [
      { title: "Neural Networks Foundations", content: "Multi-layer Perceptrons (MLP), forward propagation, loss functions." },
      { title: "Backpropagation & Optimization", content: "Gradient Descent, Stochastic Gradient Descent, Adam Optimizer, learning rate schedulers." },
      { title: "TensorFlow & Keras / PyTorch Overview", content: "Tensors, GPU acceleration, building neural layers." },
      { title: "Convolutional Neural Networks (CNN)", content: "Convolutional layers, pooling, stride, padding, feature maps." },
      { title: "Transfer Learning", content: "Using pretrained models (ResNet, VGG16) for custom image classification." },
      { title: "Recurrent Neural Networks (RNN)", content: "Sequential data processing, vanishing gradient problem." },
      { title: "LSTMs & GRUs", content: "Gated memory units for long-term dependencies in text and time series." },
      { title: "Computer Vision Applications", content: "Object detection, image segmentation overview." },
      { title: "NLP Basics & Embeddings", content: "Tokenization, Word2Vec, Attention Mechanism introduction." },
      { title: "Mini Project - Image Classifier Neural Net", content: "Train a CNN to classify fashion/medical dataset images with >90% accuracy." }
    ]
  },
  {
    title: "Data Science",
    category: "Data Science",
    level: "Intermediate",
    duration: "10 Hours",
    description: JSON.stringify({
      category: "Data Science",
      level: "Intermediate",
      duration: "10 Hours",
      overview: "Analyze, visualize, and extract actionable business insights from large datasets using NumPy and Pandas.",
      prerequisites: "Python fundamentals.",
      outcomes: [
        "Manipulate complex tabular data with Pandas & NumPy",
        "Create rich data visualizations with Matplotlib & Seaborn",
        "Build interactive analytical dashboards"
      ]
    }),
    modules: [
      { title: "Data Science Lifecycle", content: "Problem formulation, data collection, EDA, modeling, storytelling." },
      { title: "Numerical Computing with NumPy", content: "NumPy arrays, broadcasting, vectorization, linear algebra operations." },
      { title: "Data Analysis with Pandas", content: "DataFrames, Series, reading CSV/Excel/SQL, indexing, filtering." },
      { title: "Data Wrangling & Cleaning", content: "Handling missing values, deduplication, String manipulation, DateTime parsing." },
      { title: "Exploratory Data Analysis (EDA)", content: "Descriptive statistics, distributions, outlier detection methods." },
      { title: "Data Visualization", content: "Matplotlib & Seaborn plots: histograms, scatter plots, heatmaps, box plots." },
      { title: "Statistical Inference", content: "Probability distributions, hypothesis testing (t-test, chi-square), p-values." },
      { title: "Feature Transformation", content: "Groupby operations, pivot tables, aggregation pipelines." },
      { title: "Interactive Dashboards", content: "Building web dashboards using Streamlit or Plotly Dash." },
      { title: "Mini Project - Sales Analytics Dashboard", content: "Perform full EDA and publish an interactive business insights report." }
    ]
  },
  {
    title: "SQL & Database Management",
    category: "Database",
    level: "Beginner",
    duration: "7 Hours",
    description: JSON.stringify({
      category: "Database",
      level: "Beginner",
      duration: "7 Hours",
      overview: "Master relational database design, complex SQL queries, transactions, and performance indexing.",
      prerequisites: "None.",
      outcomes: [
        "Design relational database schemas with ER Diagrams",
        "Write advanced SQL queries, Joins, and Aggregations",
        "Optimize queries with indexes and ACID transactions"
      ]
    }),
    modules: [
      { title: "Database Concepts & Relational Model", content: "RDBMS principles, tables, primary keys, foreign keys, normalization." },
      { title: "ER Diagrams & Schema Design", content: "Entity-Relationship modeling, 1:1, 1:N, N:M relationships." },
      { title: "Basic SQL Queries (DDL & DML)", content: "CREATE TABLE, ALTER, INSERT, UPDATE, DELETE, SELECT statements." },
      { title: "Filtering & Aggregations", content: "WHERE, LIKE, BETWEEN, GROUP BY, HAVING, COUNT, SUM, AVG." },
      { title: "SQL Joins", content: "INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, Self Joins." },
      { title: "Subqueries & CTEs", content: "Nested queries, Correlated subqueries, Common Table Expressions (WITH clause)." },
      { title: "Database Views & Stored Procedures", content: "Creating reusable views, stored procedure syntax, triggers." },
      { title: "ACID Transactions & Concurrency", content: "BEGIN TRANSACTION, COMMIT, ROLLBACK, isolation levels." },
      { title: "Performance Tuning & Indexing", content: "B-Tree indexes, EXPLAIN query plan analysis, indexing strategies." },
      { title: "Mini Project - University Database System", content: "Design schema and write complex reporting queries for an educational platform." }
    ]
  },
  {
    title: "Cloud Computing",
    category: "DevOps",
    level: "Intermediate",
    duration: "8 Hours",
    description: JSON.stringify({
      category: "DevOps",
      level: "Intermediate",
      duration: "8 Hours",
      overview: "Deploy and manage scalable cloud infrastructure on Amazon Web Services (AWS) and Azure.",
      prerequisites: "Basic networking & OS knowledge.",
      outcomes: [
        "Understand IaaS, PaaS, and SaaS cloud paradigms",
        "Deploy virtual servers (EC2) and storage buckets (S3)",
        "Configure Cloud Security, IAM, and Auto Scaling"
      ]
    }),
    modules: [
      { title: "Cloud Computing Fundamentals", content: "Cloud benefits, public vs private vs hybrid, IaaS, PaaS, SaaS." },
      { title: "AWS Global Infrastructure", content: "Regions, Availability Zones, Edge locations, AWS Console setup." },
      { title: "Virtual Machines (EC2)", content: "Launching EC2 instances, SSH access, security groups, EBS volumes." },
      { title: "Cloud Storage (S3)", content: "Buckets, objects, static web hosting, bucket policies, lifecycle rules." },
      { title: "Networking & VPC", content: "Virtual Private Cloud (VPC), subnets, route tables, Internet Gateways." },
      { title: "Identity & Access Management (IAM)", content: "Users, groups, roles, policies, MFA enforcement." },
      { title: "Load Balancing & Auto Scaling", content: "Elastic Load Balancer (ELB), Auto Scaling Groups for high availability." },
      { title: "Cloud Databases (RDS / DynamoDB)", content: "Managed relational DBs (RDS MySQL) and NoSQL solutions." },
      { title: "Serverless Computing (Lambda)", content: "Triggering serverless functions without managing infrastructure." },
      { title: "Mini Project - Cloud Web App Deployment", content: "Deploy a Node/React application behind an AWS Load Balancer with S3 storage." }
    ]
  },
  {
    title: "Cyber Security",
    category: "Security",
    level: "Intermediate",
    duration: "9 Hours",
    description: JSON.stringify({
      category: "Security",
      level: "Intermediate",
      duration: "9 Hours",
      overview: "Understand network security threats, cryptography, web vulnerabilities (OWASP Top 10), and ethical hacking.",
      prerequisites: "Basic networking and operating system concepts.",
      outcomes: [
        "Identify web security vulnerabilities (SQLi, XSS, CSRF)",
        "Apply encryption techniques and digital signatures",
        "Perform basic vulnerability assessments"
      ]
    }),
    modules: [
      { title: "Cyber Security Fundamentals", content: "CIA Triad (Confidentiality, Integrity, Availability), threat landscape." },
      { title: "Network Security & Protocols", content: "TCP/IP security, Wireshark packet capture, Firewalls, VPNs." },
      { title: "Cryptography Principles", content: "Symmetric vs Asymmetric encryption, RSA, AES, hashing (SHA-256)." },
      { title: "Authentication & Access Control", content: "Multi-factor authentication, OAuth 2.0, RBAC models." },
      { title: "OWASP Top 10 - Web Vulnerabilities", content: "SQL Injection, Cross-Site Scripting (XSS), CSRF, Broken Auth." },
      { title: "Malware & Social Engineering", content: "Viruses, Trojans, Ransomware, Phishing vector analysis." },
      { title: "Ethical Hacking Methodology", content: "Reconnaissance, scanning, exploitation, post-exploitation." },
      { title: "Incident Response & Forensics", content: "Log analysis, threat detection, mitigation strategies." },
      { title: "Security Tools", content: "Nmap, Burp Suite, Metasploit overview." },
      { title: "Mini Project - Web Vulnerability Audit", content: "Perform a security audit on a mock web application and remediate security flaws." }
    ]
  },
  {
    title: "Git & GitHub",
    category: "DevOps",
    level: "Beginner",
    duration: "5 Hours",
    description: JSON.stringify({
      category: "DevOps",
      level: "Beginner",
      duration: "5 Hours",
      overview: "Master version control workflows, branching strategies, pull requests, and CI/CD with GitHub Actions.",
      prerequisites: "None.",
      outcomes: [
        "Manage project versions with Git commits and tags",
        "Collaborate using GitHub pull requests and code reviews",
        "Automate workflows using GitHub Actions"
      ]
    }),
    modules: [
      { title: "Version Control Systems Overview", content: "Centralized vs Distributed version control, Git architecture." },
      { title: "Git Installation & Setup", content: "Configuring user.name, user.email, SSH keys for GitHub." },
      { title: "Repositories & Basic Commands", content: "git init, git clone, git status, git add, git commit, git log." },
      { title: "Branching & Merging", content: "Creating branches, switching branches, merging, handling merge conflicts." },
      { title: "Remote Repositories", content: "git remote, git push, git pull, git fetch." },
      { title: "Pull Requests & Code Reviews", content: "Creating PRs, reviewing code, requesting changes, branch protection." },
      { title: "Advanced Git Workflows", content: "git rebase, git cherry-pick, git stash, git reset vs revert." },
      { title: "GitHub Actions & CI/CD", content: "Writing GitHub Action YAML workflows for automated testing." },
      { title: "Open Source Best Practices", content: "README creation, LICENSE, issue templates, contribution guidelines." },
      { title: "Mini Project - Collaborative Team Repo", content: "Simulate a multi-developer git workflow resolving conflicts and deploying via GitHub Actions." }
    ]
  },
  {
    title: "UI/UX Design",
    category: "Design",
    level: "Beginner",
    duration: "7 Hours",
    description: JSON.stringify({
      category: "Design",
      level: "Beginner",
      duration: "7 Hours",
      overview: "Design intuitive digital user interfaces and high-fidelity prototypes using Figma.",
      prerequisites: "None.",
      outcomes: [
        "Apply user research techniques and wireframing",
        "Design responsive UIs with Figma components & auto-layout",
        "Understand color theory, typography, and accessibility"
      ]
    }),
    modules: [
      { title: "UI vs UX Design Concepts", content: "User Experience vs User Interface principles, human-centered design." },
      { title: "User Research & Persona Creation", content: "User interviews, journey mapping, empathy maps." },
      { title: "Wireframing & Information Architecture", content: "Low-fidelity wireframes, site maps, user flow diagrams." },
      { title: "Color Theory & Palette Selection", content: "Color psychology, contrast ratios, 60-30-10 color rule." },
      { title: "Typography in Digital Products", content: "Font hierarchy, line heights, readability, font pairings." },
      { title: "Figma Masterclass", content: "Frames, shapes, vector networks, constraints, components, variants." },
      { title: "Auto Layout & Responsive UI", content: "Designing fluid components with Figma Auto-Layout 5.0." },
      { title: "Interactive Prototyping", content: "Smart animate, transition overlays, micro-interactions." },
      { title: "Design Systems & Tokens", content: "Creating style libraries, button design systems, design tokens." },
      { title: "Mini Project - Mobile Banking App UI", content: "Design a complete high-fidelity mobile app prototype ready for handoff." }
    ]
  },
  {
    title: "Aptitude & Placement Preparation",
    category: "Career",
    level: "All Levels",
    duration: "10 Hours",
    description: JSON.stringify({
      category: "Career",
      level: "All Levels",
      duration: "10 Hours",
      overview: "Prepare for corporate tech hiring: Quantitative Aptitude, Reasoning, Resume building, and Mock Interviews.",
      prerequisites: "None.",
      outcomes: [
        "Solve speed quantitative math and logical reasoning puzzles",
        "Craft an ATS-optimized software engineer resume",
        "Excel in technical coding rounds and HR behavioral interviews"
      ]
    }),
    modules: [
      { title: "Quantitative Aptitude - Arithmetic", content: "Percentages, Profit & Loss, Ratios, Averages, Time & Work." },
      { title: "Quantitative Aptitude - Algebra & Geometry", content: "Equations, Speed Time Distance, Permutations & Combinations, Probability." },
      { title: "Logical Reasoning", content: "Puzzles, Seating arrangements, Syllogisms, Blood relations, Coding-Decoding." },
      { title: "Verbal Ability & Communication", content: "Reading comprehension, sentence correction, vocabulary building." },
      { title: "Technical Coding Round Strategies", content: "Approaching DSA problems under exam pressure, time management." },
      { title: "ATS-Optimized Resume Building", content: "Action verbs, impact metrics, project formatting, ATS keywords." },
      { title: "LinkedIn Profile Optimization", content: "Headlines, summary, networking strategies, reaching out to recruiters." },
      { title: "Group Discussions & Debate", content: "GD etiquette, structuring arguments, body language." },
      { title: "Technical & HR Behavioral Interviews", content: "STAR method for behavioral questions, answering system design queries." },
      { title: "Mini Project - Full Placement Mock Drive", content: "Complete a timed online assessment and recorded mock interview process." }
    ]
  }
];

async function seed() {
  console.log("🌱 Cleaning and Re-seeding Database for EduConnect...");

  const connection = await mysql.createConnection(dbConfig);

  try {
    // Clear old jumbled data if any
    await connection.execute(`DELETE FROM lessons`);
    await connection.execute(`DELETE FROM enrollments`);
    await connection.execute(`DELETE FROM courses`);

    // 1. Create Default Users (Admin, Instructor, Student)
    const passwordHash = await bcrypt.hash('password123', 10);

    const usersToInsert = [
      { name: 'System Admin', email: 'admin@educonnect.com', role: 'admin' },
      { name: 'Dr. Sarah Connor', email: 'instructor@educonnect.com', role: 'instructor' },
      { name: 'Alex Johnson', email: 'student@educonnect.com', role: 'student' }
    ];

    console.log("👤 Seeding Users...");
    for (const u of usersToInsert) {
      await connection.execute(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role)`,
        [u.name, u.email, passwordHash, u.role]
      );
    }

    // Get Instructor ID
    const [rows]: any = await connection.execute(
      `SELECT id FROM users WHERE email = 'instructor@educonnect.com' LIMIT 1`
    );
    const instructorId = rows[0]?.id || 1;

    console.log(`📚 Seeding ${coursesData.length} Clean Courses and Modules...`);
    for (const courseItem of coursesData) {
      const [result]: any = await connection.execute(
        `INSERT INTO courses (instructor_id, title, description) VALUES (?, ?, ?)`,
        [instructorId, courseItem.title, courseItem.description]
      );
      const courseId = result.insertId;

      // Insert Lessons for Course
      for (let i = 0; i < courseItem.modules.length; i++) {
        const mod = courseItem.modules[i];
        const lessonOrder = i + 1;

        await connection.execute(
          `INSERT INTO lessons (course_id, title, content, lesson_order) VALUES (?, ?, ?, ?)`,
          [courseId, mod.title, mod.content, lessonOrder]
        );
      }
    }

    console.log("✅ Seed Completed Successfully! Clean 20 Courses & 200 Lessons Created.");
  } catch (error) {
    console.error("❌ Seed Error:", error);
  } finally {
    await connection.end();
  }
}

seed();
