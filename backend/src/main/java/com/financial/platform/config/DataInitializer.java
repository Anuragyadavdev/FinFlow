package com.financial.platform.config;

import com.financial.platform.entity.Category;
import com.financial.platform.entity.Permission;
import com.financial.platform.entity.Role;
import com.financial.platform.repository.CategoryRepository;
import com.financial.platform.repository.PermissionRepository;
import com.financial.platform.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedPermissions();
        seedRoles();
        seedDefaultCategories();
    }

    private void seedPermissions() {
        if (permissionRepository.count() > 0) {
            log.info("Permissions already seeded, skipping.");
            return;
        }

        String[][] data = {
                // resource, action
                {"USER", "VIEW_OWN"},
                {"USER", "UPDATE_OWN"},
                {"USER", "DELETE_OWN"},
                {"USER", "VIEW_ALL"},
                {"USER", "MANAGE"},

                {"ACCOUNT", "VIEW_OWN"},
                {"ACCOUNT", "CREATE"},
                {"ACCOUNT", "UPDATE_OWN"},
                {"ACCOUNT", "DELETE_OWN"},

                {"TRANSACTION", "VIEW_OWN"},
                {"TRANSACTION", "CREATE"},
                {"TRANSACTION", "UPDATE_OWN"},
                {"TRANSACTION", "DELETE_OWN"},

                {"CATEGORY", "VIEW"},
                {"CATEGORY", "CREATE"},
                {"CATEGORY", "UPDATE_OWN"},
                {"CATEGORY", "DELETE_OWN"},

                {"BUDGET", "VIEW_OWN"},
                {"BUDGET", "CREATE"},
                {"BUDGET", "UPDATE_OWN"},
                {"BUDGET", "DELETE_OWN"},

                {"GOAL", "VIEW_OWN"},
                {"GOAL", "CREATE"},
                {"GOAL", "UPDATE_OWN"},
                {"GOAL", "DELETE_OWN"},

                {"INVESTMENT", "VIEW_OWN"},
                {"INVESTMENT", "CREATE"},
                {"INVESTMENT", "UPDATE_OWN"},
                {"INVESTMENT", "DELETE_OWN"},

                {"ANALYTICS", "VIEW_OWN"},
                {"NOTIFICATION", "VIEW_OWN"},

                {"SYSTEM", "VIEW_INFO"},
                {"SYSTEM", "MANAGE"}
        };

        List<Permission> list = new ArrayList<>();
        for (String[] row : data) {
            list.add(Permission.builder()
                    .name(row[0] + "_" + row[1])
                    .resource(row[0])
                    .action(row[1])
                    .description(row[0] + " " + row[1])
                    .build());
        }
        permissionRepository.saveAll(list);
        log.info("Seeded {} permissions", list.size());
    }

    private void seedRoles() {
        if (roleRepository.count() > 0) {
            log.info("Roles already seeded, skipping.");
            return;
        }

        Map<String, Permission> byName = new HashMap<>();
        permissionRepository.findAll().forEach(p -> byName.put(p.getName(), p));

        // ADMIN — all permissions
        Role admin = Role.builder()
                .name("ADMIN")
                .description("Full system access")
                .isSystemRole(true)
                .permissions(new HashSet<>(byName.values()))
                .build();

        // USER — personal finance permissions
        Set<Permission> userPerms = new HashSet<>();
        String[] userPermNames = {
                "USER_VIEW_OWN", "USER_UPDATE_OWN", "USER_DELETE_OWN",
                "ACCOUNT_VIEW_OWN", "ACCOUNT_CREATE",
                "ACCOUNT_UPDATE_OWN", "ACCOUNT_DELETE_OWN",
                "TRANSACTION_VIEW_OWN", "TRANSACTION_CREATE",
                "TRANSACTION_UPDATE_OWN", "TRANSACTION_DELETE_OWN",
                "CATEGORY_VIEW", "CATEGORY_CREATE",
                "CATEGORY_UPDATE_OWN", "CATEGORY_DELETE_OWN",
                "BUDGET_VIEW_OWN", "BUDGET_CREATE",
                "BUDGET_UPDATE_OWN", "BUDGET_DELETE_OWN",
                "GOAL_VIEW_OWN", "GOAL_CREATE",
                "GOAL_UPDATE_OWN", "GOAL_DELETE_OWN",
                "INVESTMENT_VIEW_OWN", "INVESTMENT_CREATE",
                "INVESTMENT_UPDATE_OWN", "INVESTMENT_DELETE_OWN",
                "ANALYTICS_VIEW_OWN", "NOTIFICATION_VIEW_OWN"
        };
        for (String p : userPermNames) {
            if (byName.containsKey(p)) userPerms.add(byName.get(p));
        }

        Role user = Role.builder()
                .name("USER")
                .description("Regular user access")
                .isSystemRole(true)
                .permissions(userPerms)
                .build();

        // LIMITED_DASHBOARD — very restricted
        Set<Permission> limitedPerms = new HashSet<>();
        String[] limitedNames = {"USER_VIEW_OWN", "ANALYTICS_VIEW_OWN"};
        for (String p : limitedNames) {
            if (byName.containsKey(p)) limitedPerms.add(byName.get(p));
        }

        Role limited = Role.builder()
                .name("LIMITED_DASHBOARD")
                .description("Read-only dashboard access")
                .isSystemRole(true)
                .permissions(limitedPerms)
                .build();

        roleRepository.saveAll(Arrays.asList(admin, user, limited));
        log.info("Seeded 3 roles");
    }

    private void seedDefaultCategories() {
        if (categoryRepository.count() > 0) {
            log.info("Categories already seeded, skipping.");
            return;
        }

        Object[][] expense = {
                {"Food & Dining", "🍔", "#FF6B6B"},
                {"Transportation", "🚗", "#4ECDC4"},
                {"Shopping", "🛍️", "#FFE66D"},
                {"Entertainment", "🎬", "#A8E6CF"},
                {"Utilities", "💡", "#FFB6B9"},
                {"Rent", "🏠", "#C7CEEA"},
                {"Insurance", "🛡️", "#B5EAD7"},
                {"Healthcare", "🏥", "#FFDAC1"},
                {"Education", "📚", "#E2F0CB"},
                {"Subscriptions", "📺", "#FFB7B2"},
                {"Personal Care", "💅", "#F8B195"},
                {"Travel", "✈️", "#6C5B7B"},
                {"Miscellaneous", "📦", "#B2B2B2"}
        };

        Object[][] income = {
                {"Salary", "💰", "#22C55E"},
                {"Freelance", "💻", "#16A34A"},
                {"Investment Income", "📈", "#10B981"},
                {"Rental Income", "🏘️", "#059669"},
                {"Business Income", "🏢", "#047857"},
                {"Gift", "🎁", "#34D399"},
                {"Refund", "↩️", "#6EE7B7"},
                {"Other Income", "💵", "#A7F3D0"}
        };

        List<Category> list = new ArrayList<>();
        for (Object[] row : expense) {
            list.add(Category.builder()
                    .name((String) row[0])
                    .icon((String) row[1])
                    .color((String) row[2])
                    .type(Category.CategoryType.EXPENSE)
                    .isDefault(true).isActive(true).build());
        }
        for (Object[] row : income) {
            list.add(Category.builder()
                    .name((String) row[0])
                    .icon((String) row[1])
                    .color((String) row[2])
                    .type(Category.CategoryType.INCOME)
                    .isDefault(true).isActive(true).build());
        }

        categoryRepository.saveAll(list);
        log.info("Seeded {} default categories", list.size());
    }
}