import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Home,
    Users,
    FileText,
    DollarSign,
    Calculator,
    ChevronDown,
    ChevronRight,
    X,
    Receipt,
    CreditCard,
    ClipboardList,
    BarChart3,
    Settings,
} from "lucide-react";

const Sidebar = ({ isMobile, isSidebarOpen, toggleSidebar }) => {
    const location = useLocation();
    const [expandedSections, setExpandedSections] = React.useState({
        payments: true,
    });

    // Get user role from localStorage
    const getUserRole = () => {
        try {
            return localStorage.getItem("userRole") || "admin";
        } catch (error) {
            console.error("Error accessing localStorage:", error);
            return "admin";
        }
    };

    const userRole = getUserRole();

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // Define role permissions for each navigation item
    const navigationItems = [
        {
            id: "payments",
            title: "Payment Management",
            icon: DollarSign,
            allowedRoles: ["admin", "accountant", "manager", "user"],
            items: [
                {
                    path: "/payment-voucher-table",
                    label: "View Payment Vouchers",
                    icon: ClipboardList,
                    allowedRoles: ["admin", "accountant", "manager", "user"],
                },
                {
                    path: "/payslipUI",
                    label: "View Payslips",
                    icon: Users,
                    allowedRoles: ["admin", "accountant", "manager", "user"],
                },
            ],
        },
    ];

    // Filter navigation items based on user role
    const getFilteredNavigationItems = () => {
        return navigationItems
            .filter((section) => section.allowedRoles.includes(userRole))
            .map((section) => ({
                ...section,
                items: section.items.filter((item) =>
                    item.allowedRoles.includes(userRole)
                ),
            }))
            .filter((section) => section.items.length > 0); // Remove sections with no accessible items
    };

    const filteredNavigationItems = getFilteredNavigationItems();

    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    const isSectionActive = (items) => {
        return items.some((item) => isActiveRoute(item.path));
    };

    // Debug info (remove in production)
    React.useEffect(() => {
        console.log("Current user role:", userRole);
        console.log("Filtered navigation items:", filteredNavigationItems);
    }, [userRole]);

    return (
        <>
            {/* Sidebar */}
            <div
                className={`
          fixed md:relative top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg
          transition-all duration-300 ease-in-out z-40
          ${isMobile
                        ? `w-80 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`
                        : `${isSidebarOpen ? "w-80" : "w-0 overflow-hidden"}`
                    }
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between ">
                        {isMobile && (
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        {filteredNavigationItems.length === 0 ? (
                            <div className="text-center text-gray-500 mt-8">
                                <p>No accessible menu items for your role.</p>
                                <p className="text-sm mt-2">
                                    Contact your administrator for access.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredNavigationItems.map((section) => {
                                    const SectionIcon = section.icon;
                                    const isExpanded = expandedSections[section.id];
                                    const hasActiveItem = isSectionActive(section.items);

                                    return (
                                        <div key={section.id} className="space-y-1">
                                            {/* Section Header */}
                                            <button
                                                onClick={() => toggleSection(section.id)}
                                                className={`
                          w-full flex items-center justify-between p-4 rounded-lg
                          transition-all duration-200 text-left cursor-pointer
                         
                        `}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <SectionIcon className="w-6 h-6 text-sidebar-foreground" />
                                                    <span className="font-semibold text-lg text-sidebar-foreground">
                                                        {section.title}
                                                    </span>
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronDown className="w-5 h-5 text-sidebar-foreground" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-sidebar-foreground" />
                                                )}
                                            </button>

                                            {/* Section Items */}
                                            <div
                                                className={`
                          overflow-hidden transition-all duration-300 ease-in-out
                          ${isExpanded
                                                        ? "max-h-96 opacity-100"
                                                        : "max-h-0 opacity-0"
                                                    }
                        `}
                                            >
                                                <div className="pl-6 space-y-2">
                                                    {section.items.map((item) => {
                                                        const ItemIcon = item.icon;
                                                        const isActive = isActiveRoute(item.path);

                                                        return (
                                                            <Link
                                                                key={item.path}
                                                                to={item.path}
                                                                onClick={isMobile ? toggleSidebar : undefined}
                                                                className={`
                                  flex items-center space-x-4 p-3 rounded-lg
                                  transition-all duration-200 group
                                  ${isActive
                                                                        ? "bg-sidebar-primary text-sidebar-primary-foreground border-l-4 border-sidebar-border"
                                                                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                                                    }
                                `}
                                                            >
                                                                <ItemIcon
                                                                    className={`w-5 h-5 ${isActive
                                                                        ? "text-sidebar-primary-foreground"
                                                                        : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                                                                        }`}
                                                                />
                                                                <span className="text-base font-medium">
                                                                    {item.label}
                                                                </span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
