import { AppDataSource } from "../DataSource.config";
import { UserModel } from "../../models/User.model";
import { FeatureFlagModel } from "../../models/FeatureFlag.model";
import { FlagRuleModel } from "../../models/FlagRule.model";
import { FlagConditionModel } from "../../models/FlagCondition.model";
import { UserRole, RuleType, ConditionOperator } from "../../types/Api.types";
import bcrypt from "bcryptjs";

export async function seedInitialData() {
  const userRepository = AppDataSource.getRepository(UserModel);
  const featureFlagRepository = AppDataSource.getRepository(FeatureFlagModel);
  const flagRuleRepository = AppDataSource.getRepository(FlagRuleModel);
  const flagConditionRepository = AppDataSource.getRepository(FlagConditionModel);

  // Create admin user
  const existingAdmin = await userRepository.findOne({ where: { email: "admin@example.com" } });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("password123", 12);
    const adminUser = userRepository.create({
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
      role: UserRole.ADMIN,
    });
    
    const savedAdmin = await userRepository.save(adminUser);
    console.log("✅ Admin user created:", savedAdmin.email);

    // Create sample feature flag
    const existingFlag = await featureFlagRepository.findOne({ 
      where: { key: "new-feature" },
      relations: ["rules", "rules.conditions"]
    });
    
    if (!existingFlag) {
      const sampleFlag = featureFlagRepository.create({
        key: "new-feature",
        name: "New Feature",
        description: "A new feature for testing",
        enabled: true,
        defaultValue: false,
        createdBy: savedAdmin.id,
      });
      
      const savedFlag = await featureFlagRepository.save(sampleFlag);
      console.log("✅ Sample feature flag created:", savedFlag.key);

      // Create flag rules and conditions
      // Rule 1: Enable for specific user ID
      const userIdRule = flagRuleRepository.create({
        type: RuleType.USER_ID,
        value: true,
        priority: 1,
        featureFlag: savedFlag,
      });
      const savedUserIdRule = await flagRuleRepository.save(userIdRule);

      const userIdCondition = flagConditionRepository.create({
        field: "userId",
        operator: ConditionOperator.EQUALS,
        value: savedAdmin.id, // Use the admin user ID
        rule: savedUserIdRule,
      });
      await flagConditionRepository.save(userIdCondition);
      console.log("✅ User ID rule created for new-feature flag");

      // Rule 2: Enable for admin role
      const adminRoleRule = flagRuleRepository.create({
        type: RuleType.ROLE,
        value: true,
        priority: 2,
        featureFlag: savedFlag,
      });
      const savedAdminRoleRule = await flagRuleRepository.save(adminRoleRule);

      const adminRoleCondition = flagConditionRepository.create({
        field: "role",
        operator: ConditionOperator.EQUALS,
        value: UserRole.ADMIN,
        rule: savedAdminRoleRule,
      });
      await flagConditionRepository.save(adminRoleCondition);
      console.log("✅ Admin role rule created for new-feature flag");

    } else {
      console.log("ℹ️  Feature flag 'new-feature' already exists");
    }
  } else {
    console.log("ℹ️  Admin user already exists");
    
    // Check if feature flag exists and create it if not, even if admin exists
    const existingFlag = await featureFlagRepository.findOne({ 
      where: { key: "new-feature" },
      relations: ["rules", "rules.conditions"]
    });
    
    if (!existingFlag) {
      const sampleFlag = featureFlagRepository.create({
        key: "new-feature",
        name: "New Feature",
        description: "A new feature for testing",
        enabled: true,
        defaultValue: false,
        createdBy: existingAdmin.id,
      });
      
      const savedFlag = await featureFlagRepository.save(sampleFlag);
      console.log("✅ Sample feature flag created:", savedFlag.key);

      // Create flag rules and conditions
      // Rule 1: Enable for specific user ID
      const userIdRule = flagRuleRepository.create({
        type: RuleType.USER_ID,
        value: true,
        priority: 1,
        featureFlag: savedFlag,
      });
      const savedUserIdRule = await flagRuleRepository.save(userIdRule);

      const userIdCondition = flagConditionRepository.create({
        field: "userId",
        operator: ConditionOperator.EQUALS,
        value: existingAdmin.id, // Use the existing admin user ID
        rule: savedUserIdRule,
      });
      await flagConditionRepository.save(userIdCondition);
      console.log("✅ User ID rule created for new-feature flag");

      // Rule 2: Enable for admin role
      const adminRoleRule = flagRuleRepository.create({
        type: RuleType.ROLE,
        value: true,
        priority: 2,
        featureFlag: savedFlag,
      });
      const savedAdminRoleRule = await flagRuleRepository.save(adminRoleRule);

      const adminRoleCondition = flagConditionRepository.create({
        field: "role",
        operator: ConditionOperator.EQUALS,
        value: UserRole.ADMIN,
        rule: savedAdminRoleRule,
      });
      await flagConditionRepository.save(adminRoleCondition);
      console.log("✅ Admin role rule created for new-feature flag");
    } else {
      console.log("ℹ️  Feature flag 'new-feature' already exists");
    }
  }
} 