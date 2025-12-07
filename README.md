# OrbitFinance 🪐

**A Product of [Cordulatech](https://cordulatech.com)**

**OrbitFinance** is a next-generation, SaaS-ready expense tracker featuring a stunning 3D immersive interface, multi-workspace support, and a robust admin management system. Built with modern web technologies, it offers a "Deep Space" aesthetic with glassmorphism UI elements.

![OrbitFinance Screenshot](https://via.placeholder.com/1200x600.png?text=OrbitFinance+Dashboard+Preview)

## 🚀 Key Features

### 🌟 Immersive Experience
- **3D Visualizations**: Interactive 3D Torus charts for expense breakdowns using `react-three-fiber`.
- **Dynamic Backgrounds**: Floating particle systems and meshes that react to user interaction.
- **Glassmorphism UI**: Modern, translucent card designs with backdrop blurs.
- **Theme Support**: Seamless toggle between **Cyberpunk Dark** and **Clean Light** modes.

### 💼 Workspace Management
- **Multi-Workspace**: Create separate trackers for Personal, Business, or Travel expenses.
- **Collaboration**: Invite members to your workspace to track expenses together.
- **Customization**: Set custom currencies and categories per workspace.

### 🛡️ Admin Dashboard
- **User Management**: Dedicated Admin Panel to view all registered users.
- **Access Control**: Create new users, delete accounts, and reset user passwords securely.
- **Role-Based Access**: Strict separation between `User` and `Admin` roles.

### 📱 Responsive Design
- **Mobile First**: Fully optimized for mobile devices with a custom drawer navigation.
- **Fluid Animations**: Smooth transitions powered by `framer-motion`.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) (via Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **3D Engine**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) & [Drei](https://github.com/pmndrs/drei)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/OrbitFinance.git
   cd OrbitFinance
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## 🔐 Credentials (Mock Mode)

The application currently runs with a **Mock Database Service** (`services/mockDb.ts`) for demonstration purposes. You can use the following default credentials:

### 👤 Standard User
- **Email**: `demo@orbit.com`
- **Password**: (Any password works in mock mode)

### 🛡️ Administrator
- **Email**: `admin@orbit.com`
- **Password**: (Any password works in mock mode)

> **Note**: To test the **Admin Panel**, log in with the admin email. You will see a "Shield" icon in the sidebar/menu to access the user management dashboard.

---

## 🗄️ Database Integration (Supabase)

This project is architected to switch easily from the `mockDb` to a real backend like **Supabase**.

1. **Replace Service**: Update `services/mockDb.ts` to use `@supabase/supabase-js`.
2. **RLS Policies**: The app supports Row Level Security logic. Ensure your Supabase tables (`users`, `workspaces`, `transactions`) have RLS enabled.
   - *Users* can only view workspaces they are members of.
   - *Admins* have full read/write access to the `profiles` table.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
