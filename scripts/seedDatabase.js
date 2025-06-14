const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../src/models/user.model');
const Facility = require('../src/models/facility.model');
const FacilityStaff = require('../src/models/facilityStaff.model');
const BloodGroup = require('../src/models/bloodGroup.model');
const BloodComponent = require('../src/models/bloodComponent.model');
const BloodDonationRegistration = require('../src/models/bloodDonationRegistration.model');
const BloodDonation = require('../src/models/bloodDonation.model');
const HealthCheck = require('../src/models/healthCheck.model');
const ProcessDonationLog = require('../src/models/processDonationLog.model');
const BloodUnit = require('../src/models/bloodUnit.model');
const BloodInventory = require('../src/models/bloodInventory.model');
const BloodRequest = require('../src/models/bloodRequest.model');
const BloodRequestSupport = require('../src/models/bloodRequestSupport.model');

// Import Gift models
const GiftItem = require('../src/models/giftItem.model');
const GiftPackage = require('../src/models/giftPackage.model');
const GiftInventory = require('../src/models/giftInventory.model');
const GiftBudget = require('../src/models/giftBudget.model');
const GiftDistribution = require('../src/models/giftDistribution.model');
const GiftLog = require('../src/models/giftLog.model');

// Import Content models
const ContentCategory = require('../src/models/contentCategory.model');
const Content = require('../src/models/content.model');

// Import constants
const {
  USER_ROLE,
  STAFF_POSITION,
  BLOOD_GROUP,
  SEX,
  USER_STATUS,
  PROFILE_LEVEL,
  BLOOD_DONATION_REGISTRATION_STATUS,
  BLOOD_DONATION_REGISTRATION_SOURCE,
  BLOOD_COMPONENT,
  BLOOD_DONATION_STATUS,
  HEALTH_CHECK_STATUS,
  BLOOD_UNIT_STATUS,
  TEST_BLOOD_UNIT_RESULT,
  BLOOD_REQUEST_STATUS,
  GIFT_ITEM_CATEGORY,
  GIFT_ITEM_UNIT,
  GIFT_ACTION,
  CONTENT_STATUS
} = require('../src/constants/enum');

// MongoDB connection string - adjust as needed
const MONGODB_URI ='mongodb://localhost:27017/bloodhouse';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Facility.deleteMany({});
    await FacilityStaff.deleteMany({});
    await BloodGroup.deleteMany({});
    await BloodComponent.deleteMany({});
    await BloodDonationRegistration.deleteMany({});
    await BloodDonation.deleteMany({});
    await HealthCheck.deleteMany({});
    await ProcessDonationLog.deleteMany({});
    await BloodUnit.deleteMany({});
    await BloodInventory.deleteMany({});
    await BloodRequest.deleteMany({});
    await BloodRequestSupport.deleteMany({});
    
    // Clear gift data
    await GiftItem.deleteMany({});
    await GiftPackage.deleteMany({});
    await GiftInventory.deleteMany({});
    await GiftBudget.deleteMany({});
    await GiftDistribution.deleteMany({});
    await GiftLog.deleteMany({});
    
    // Clear content data
    await Content.deleteMany({});
    await ContentCategory.deleteMany({});
    
    console.log('🧹 Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

async function createBloodGroups() {
  const bloodGroups = [
    {
      name: BLOOD_GROUP.O_POSITIVE,
      populationRate: 37.4,
      characteristics: ['Universal donor for red cells', 'Most common blood type'],
      note: 'Máu O+ là nhóm máu phổ biến nhất'
    },
    {
      name: BLOOD_GROUP.A_POSITIVE,
      populationRate: 35.7,
      characteristics: ['Can donate to A+ and AB+', 'Can receive from A and O'],
      note: 'Nhóm máu A+ phổ biến thứ hai'
    },
    {
      name: BLOOD_GROUP.B_POSITIVE,
      populationRate: 8.5,
      characteristics: ['Can donate to B+ and AB+', 'Can receive from B and O'],
      note: 'Nhóm máu B+ ít phổ biến hơn'
    },
    {
      name: BLOOD_GROUP.AB_POSITIVE,
      populationRate: 3.4,
      characteristics: ['Universal plasma donor', 'Can receive from all blood types'],
      note: 'Nhóm máu AB+ là người nhận đa năng'
    },
    {
      name: BLOOD_GROUP.O_NEGATIVE,
      populationRate: 6.6,
      characteristics: ['Universal donor', 'Can only receive from O-'],
      note: 'Nhóm máu O- là người cho đa năng'
    },
    {
      name: BLOOD_GROUP.A_NEGATIVE,
      populationRate: 6.3,
      characteristics: ['Can donate to A and AB', 'Can only receive from A- and O-'],
      note: 'Nhóm máu A- hiếm gặp'
    },
    {
      name: BLOOD_GROUP.B_NEGATIVE,
      populationRate: 1.5,
      characteristics: ['Can donate to B and AB', 'Can only receive from B- and O-'],
      note: 'Nhóm máu B- rất hiếm'
    },
    {
      name: BLOOD_GROUP.AB_NEGATIVE,
      populationRate: 0.6,
      characteristics: ['Rarest blood type', 'Universal plasma donor'],
      note: 'Nhóm máu AB- hiếm nhất'
    }
  ];

  const createdBloodGroups = await BloodGroup.insertMany(bloodGroups);
  console.log(`✅ Created ${createdBloodGroups.length} blood groups`);
  return createdBloodGroups;
}

async function createBloodComponents() {
  const bloodComponents = [
    {
      name: BLOOD_COMPONENT.WHOLE
    },
    {
      name: BLOOD_COMPONENT.RED_CELLS
    },
    {
      name: BLOOD_COMPONENT.PLASMA
    },
    {
      name: BLOOD_COMPONENT.PLATELETS
    }
  ];

  const createdBloodComponents = await BloodComponent.insertMany(bloodComponents);
  console.log(`✅ Created ${createdBloodComponents.length} blood components`);
  return createdBloodComponents;
}

async function createFacilities() {
  const facilities = [
    {
      name: 'Bệnh viện Chợ Rẫy - Khoa Huyết học',
      code: 'CR_BLOOD_001',
      address: '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM',
      location: {
        type: 'Point',
        coordinates: [106.6583, 10.7554] // Longitude, Latitude của Chợ Rẫy
      },
      avgRating: 4.6,
      totalFeedback: 1850,
      contactPhone: '028-38551281',
      contactEmail: 'huyethoc@choray.vn',
      isActive: true
    },
    {
      name: 'Viện Huyết học - Truyền máu TP.HCM',
      code: 'IHTTM_HCM_001',
      address: '118 Hồng Bàng, Phường 12, Quận 5, TP.HCM',
      location: {
        type: 'Point',
        coordinates: [106.6544, 10.7614] // Longitude, Latitude của Viện Huyết học HCM
      },
      avgRating: 4.8,
      totalFeedback: 1420,
      contactPhone: '028-38554269',
      contactEmail: 'contact@ihttm-hcm.org.vn',
      isActive: true
    }
  ];

  const createdFacilities = await Facility.insertMany(facilities);
  console.log(`✅ Created ${createdFacilities.length} facilities`);
  return createdFacilities;
}

async function createUsers(bloodGroups) {
  const saltRounds = 10;
  const defaultPassword = await bcrypt.hash('password123', saltRounds);

  // Create 20 users with different roles
  const users = [
    // 2 ADMIN users
    {
      email: 'admin1@bloodhouse.vn',
      password: defaultPassword,
      role: USER_ROLE.ADMIN,
      fullName: 'Nguyễn Văn Admin',
      phone: '0901111111',
      sex: SEX.MALE,
      yob: new Date('1985-05-15'),
      bloodId: bloodGroups[0]._id, // O+
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001085012345',
      address: 'Số 1 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội'
    },
    {
      email: 'admin2@bloodhouse.vn',
      password: defaultPassword,
      role: USER_ROLE.ADMIN,
      fullName: 'Trần Thị Admin',
      phone: '0901111112',
      sex: SEX.FEMALE,
      yob: new Date('1988-03-20'),
      bloodId: bloodGroups[1]._id, // A+
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001088032001',
      address: 'Số 10 Láng Hạ, Đống Đa, Hà Nội'
    },
    
    // 2 MANAGER users (will be assigned to facilities)
    {
      email: 'manager1@choray.vn',
      password: defaultPassword,
      role: USER_ROLE.MANAGER,
      fullName: 'Lê Văn Quản Lý',
      phone: '0902222221',
      sex: SEX.MALE,
      yob: new Date('1982-07-10'),
      bloodId: bloodGroups[2]._id, // B+
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001082071001',
      address: '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM'
    },
    {
      email: 'manager2@ihttm-hcm.vn',
      password: defaultPassword,
      role: USER_ROLE.MANAGER,
      fullName: 'Phạm Thị Quản Lý',
      phone: '0902222222',
      sex: SEX.FEMALE,
      yob: new Date('1984-11-25'),
      bloodId: bloodGroups[3]._id, // AB+
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001084112502',
      address: '118 Hồng Bàng, Phường 12, Quận 5, TP.HCM'
    },

    // 4 DOCTOR users (2 for each facility)
    {
      email: 'doctor1@choray.vn',
      password: defaultPassword,
      role: USER_ROLE.DOCTOR,
      fullName: 'BS. Nguyễn Văn Bác Sĩ',
      phone: '0903333331',
      sex: SEX.MALE,
      yob: new Date('1980-01-15'),
      bloodId: bloodGroups[4]._id, // O-
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001080011501',
      address: 'Số 45 Lê Lợi, Quận 1, TP.HCM'
    },
    {
      email: 'doctor2@choray.vn',
      password: defaultPassword,
      role: USER_ROLE.DOCTOR,
      fullName: 'BS. Trần Thị Bác Sĩ',
      phone: '0903333332',
      sex: SEX.FEMALE,
      yob: new Date('1983-06-30'),
      bloodId: bloodGroups[5]._id, // A-
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001083063002',
      address: 'Số 123 Võ Văn Tần, Quận 3, TP.HCM'
    },
    {
      email: 'doctor3@ihttm-hcm.vn',
      password: defaultPassword,
      role: USER_ROLE.DOCTOR,
      fullName: 'BS. Lê Văn Bác Sĩ',
      phone: '0903333333',
      sex: SEX.MALE,
      yob: new Date('1981-09-12'),
      bloodId: bloodGroups[6]._id, // B-
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001081091203',
      address: 'Số 67 Pasteur, Quận 1, TP.HCM'
    },
    {
      email: 'doctor4@ihttm-hcm.vn',
      password: defaultPassword,
      role: USER_ROLE.DOCTOR,
      fullName: 'BS. Phạm Thị Bác Sĩ',
      phone: '0903333334',
      sex: SEX.FEMALE,
      yob: new Date('1986-12-05'),
      bloodId: bloodGroups[7]._id, // AB-
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001086120504',
      address: 'Số 89 Nguyễn Thị Minh Khai, Quận 3, TP.HCM'
    },

    // 6 NURSE users (3 for each facility)
    {
      email: 'nurse1@choray.vn',
      password: defaultPassword,
      role: USER_ROLE.NURSE,
      fullName: 'Y tá Nguyễn Thị Điều Dưỡng',
      phone: '0904444441',
      sex: SEX.FEMALE,
      yob: new Date('1990-02-14'),
      bloodId: bloodGroups[0]._id, // O+
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001090021401',
      address: 'Số 234 Điện Biên Phủ, Quận 10, TP.HCM'
    },
    {
      email: 'nurse2@choray.vn',
      password: defaultPassword,
      role: USER_ROLE.NURSE,
      fullName: 'Y tá Trần Thị Điều Dưỡng',
      phone: '0904444442',
      sex: SEX.FEMALE,
      yob: new Date('1992-08-22'),
      bloodId: bloodGroups[1]._id, // A+
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001092082202',
      address: 'Số 156 Cộng Hòa, Quận Tân Bình, TP.HCM'
    },
    {
      email: 'nurse3@choray.vn',
      password: defaultPassword,
      role: USER_ROLE.NURSE,
      fullName: 'Y tá Lê Văn Điều Dưỡng',
      phone: '0904444443',
      sex: SEX.MALE,
      yob: new Date('1991-04-18'),
      bloodId: bloodGroups[2]._id, // B+
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001091041803',
      address: 'Số 78 Hoàng Văn Thụ, Quận Phú Nhuận, TP.HCM'
    },
    {
      email: 'nurse4@ihttm-hcm.vn',
      password: defaultPassword,
      role: USER_ROLE.NURSE,
      fullName: 'Y tá Phạm Thị Điều Dưỡng',
      phone: '0904444444',
      sex: SEX.FEMALE,
      yob: new Date('1989-10-30'),
      bloodId: bloodGroups[3]._id, // AB+
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001089103004',
      address: 'Số 345 Lạc Long Quân, Quận 11, TP.HCM'
    },
    {
      email: 'nurse5@ihttm-hcm.vn',
      password: defaultPassword,
      role: USER_ROLE.NURSE,
      fullName: 'Y tá Hoàng Thị Điều Dưỡng',
      phone: '0904444445',
      sex: SEX.FEMALE,
      yob: new Date('1993-07-16'),
      bloodId: bloodGroups[4]._id, // O-
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001093071605',
      address: 'Số 567 Âu Cơ, Quận Tân Phú, TP.HCM'
    },
    {
      email: 'nurse6@ihttm-hcm.vn',
      password: defaultPassword,
      role: USER_ROLE.NURSE,
      fullName: 'Y tá Vũ Văn Điều Dưỡng',
      phone: '0904444446',
      sex: SEX.MALE,
      yob: new Date('1990-12-08'),
      bloodId: bloodGroups[5]._id, // A-
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001090120806',
      address: 'Số 89 Phan Văn Trị, Quận Bình Thạnh, TP.HCM'
    },

    // 6 MEMBER users (blood donors)
    {
      email: 'donor1@gmail.com',
      password: defaultPassword,
      role: USER_ROLE.MEMBER,
      fullName: 'Nguyễn Văn Hiến',
      phone: '0905555551',
      sex: SEX.MALE,
      yob: new Date('1995-03-12'),
      bloodId: bloodGroups[0]._id, // O+
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001095031201',
      address: 'Số 123 Lý Tự Trọng, Quận 1, TP.HCM',
      isAvailable: true
    },
    {
      email: 'donor2@gmail.com',
      password: defaultPassword,
      role: USER_ROLE.MEMBER,
      fullName: 'Trần Thị Hiến',
      phone: '0905555552',
      sex: SEX.FEMALE,
      yob: new Date('1994-09-25'),
      bloodId: bloodGroups[1]._id, // A+
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001094092502',
      address: 'Số 456 Nguyễn Văn Cừ, Quận 5, TP.HCM',
      isAvailable: true
    },
    {
      email: 'donor3@gmail.com',
      password: defaultPassword,
      role: USER_ROLE.MEMBER,
      fullName: 'Lê Văn Hiến',
      phone: '0905555553',
      sex: SEX.MALE,
      yob: new Date('1992-11-18'),
      bloodId: bloodGroups[2]._id, // B+
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001092111803',
      address: 'Số 789 Trường Chinh, Quận Tân Bình, TP.HCM',
      isAvailable: true
    },
    {
      email: 'donor4@gmail.com',
      password: defaultPassword,
      role: USER_ROLE.MEMBER,
      fullName: 'Phạm Thị Hiến',
      phone: '0905555554',
      sex: SEX.FEMALE,
      yob: new Date('1996-01-07'),
      bloodId: bloodGroups[3]._id, // AB+
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001096010704',
      address: 'Số 234 Quang Trung, Quận Gò Vấp, TP.HCM',
      isAvailable: true
    },
    {
      email: 'donor5@gmail.com',
      password: defaultPassword,
      role: USER_ROLE.MEMBER,
      fullName: 'Hoàng Văn Hiến',
      phone: '0905555555',
      sex: SEX.MALE,
      yob: new Date('1993-06-14'),
      bloodId: bloodGroups[4]._id, // O-
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001093061405',
      address: 'Số 567 Phạm Văn Đồng, Quận Bình Thạnh, TP.HCM',
      isAvailable: true
    },
    {
      email: 'donor6@gmail.com',
      password: defaultPassword,
      role: USER_ROLE.MEMBER,
      fullName: 'Vũ Thị Hiến',
      phone: '0905555556',
      sex: SEX.FEMALE,
      yob: new Date('1997-04-22'),
      bloodId: bloodGroups[5]._id, // A-
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001097042206',
      address: 'Số 890 Lê Văn Việt, Quận 9, TP.HCM',
      isAvailable: true
    },
    
    // 4 additional MEMBER users (blood donors) - Total 10 donors
    {
      email: 'donor7@gmail.com',
      password: defaultPassword,
      role: USER_ROLE.MEMBER,
      fullName: 'Đặng Văn Hiến',
      phone: '0905555557',
      sex: SEX.MALE,
      yob: new Date('1991-08-15'),
      bloodId: bloodGroups[6]._id, // B-
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001091081507',
      address: 'Số 123 Võ Thị Sáu, Quận 3, TP.HCM',
      isAvailable: true
    },
    {
      email: 'donor8@gmail.com',
      password: defaultPassword,
      role: USER_ROLE.MEMBER,
      fullName: 'Bùi Thị Hiến',
      phone: '0905555558',
      sex: SEX.FEMALE,
      yob: new Date('1995-12-03'),
      bloodId: bloodGroups[7]._id, // AB-
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001095120308',
      address: 'Số 456 Lê Thánh Tôn, Quận 1, TP.HCM',
      isAvailable: true
    },
    {
      email: 'donor9@gmail.com',
      password: defaultPassword,
      role: USER_ROLE.MEMBER,
      fullName: 'Cao Văn Hiến',
      phone: '0905555559',
      sex: SEX.MALE,
      yob: new Date('1990-05-28'),
      bloodId: bloodGroups[0]._id, // O+
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001090052809',
      address: 'Số 789 Nguyễn Huệ, Quận 1, TP.HCM',
      isAvailable: true
    },
    {
      email: 'donor10@gmail.com',
      password: defaultPassword,
      role: USER_ROLE.MEMBER,
      fullName: 'Mai Thị Hiến',
      phone: '0905555560',
      sex: SEX.FEMALE,
      yob: new Date('1993-10-16'),
      bloodId: bloodGroups[1]._id, // A+
      status: USER_STATUS.ACTIVE,
      profileLevel: PROFILE_LEVEL.VERIFIED_CCCD,
      idCard: '001093101610',
      address: 'Số 345 Hai Bà Trưng, Quận 1, TP.HCM',
      isAvailable: true
    }
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
}

async function createFacilityStaff(users, facilities) {
  const facilityStaffData = [];

  // Find users by role
  const managers = users.filter(user => user.role === USER_ROLE.MANAGER);
  const doctors = users.filter(user => user.role === USER_ROLE.DOCTOR);
  const nurses = users.filter(user => user.role === USER_ROLE.NURSE);

  // Assign staff to Facility 1 (Chợ Rẫy)
  const facility1 = facilities[0];
  
  console.log(`🏥 Assigning staff to ${facility1.name} (${facility1._id})`);
  
  // 1 Manager for facility 1
  facilityStaffData.push({
    userId: managers[0]._id,
    facilityId: facility1._id,
    position: STAFF_POSITION.MANAGER,
    assignedAt: new Date('2024-01-01')
  });

  // 2 Doctors for facility 1
  facilityStaffData.push({
    userId: doctors[0]._id,
    facilityId: facility1._id,
    position: STAFF_POSITION.DOCTOR,
    assignedAt: new Date('2024-01-01')
  });
  facilityStaffData.push({
    userId: doctors[1]._id,
    facilityId: facility1._id,
    position: STAFF_POSITION.DOCTOR,
    assignedAt: new Date('2024-01-01')
  });

  // 3 Nurses for facility 1
  facilityStaffData.push({
    userId: nurses[0]._id,
    facilityId: facility1._id,
    position: STAFF_POSITION.NURSE,
    assignedAt: new Date('2024-01-01')
  });
  facilityStaffData.push({
    userId: nurses[1]._id,
    facilityId: facility1._id,
    position: STAFF_POSITION.NURSE,
    assignedAt: new Date('2024-01-01')
  });
  facilityStaffData.push({
    userId: nurses[2]._id,
    facilityId: facility1._id,
    position: STAFF_POSITION.NURSE,
    assignedAt: new Date('2024-01-01')
  });

  // Assign staff to Facility 2 (Viện Huyết học)
  const facility2 = facilities[1];
  
  console.log(`🏥 Assigning staff to ${facility2.name} (${facility2._id})`);
  
  // 1 Manager for facility 2
  facilityStaffData.push({
    userId: managers[1]._id,
    facilityId: facility2._id,
    position: STAFF_POSITION.MANAGER,
    assignedAt: new Date('2024-01-01')
  });

  // 2 Doctors for facility 2
  facilityStaffData.push({
    userId: doctors[2]._id,
    facilityId: facility2._id,
    position: STAFF_POSITION.DOCTOR,
    assignedAt: new Date('2024-01-01')
  });
  facilityStaffData.push({
    userId: doctors[3]._id,
    facilityId: facility2._id,
    position: STAFF_POSITION.DOCTOR,
    assignedAt: new Date('2024-01-01')
  });

  // 3 Nurses for facility 2
  facilityStaffData.push({
    userId: nurses[3]._id,
    facilityId: facility2._id,
    position: STAFF_POSITION.NURSE,
    assignedAt: new Date('2024-01-01')
  });
  facilityStaffData.push({
    userId: nurses[4]._id,
    facilityId: facility2._id,
    position: STAFF_POSITION.NURSE,
    assignedAt: new Date('2024-01-01')
  });
  facilityStaffData.push({
    userId: nurses[5]._id,
    facilityId: facility2._id,
    position: STAFF_POSITION.NURSE,
    assignedAt: new Date('2024-01-01')
  });

  const createdFacilityStaff = await FacilityStaff.insertMany(facilityStaffData);
  console.log(`✅ Created ${createdFacilityStaff.length} facility staff assignments`);
  return createdFacilityStaff;
}

async function createBloodDonationRegistrations(users, facilities, bloodGroups, facilityStaff) {
  const registrations = [];
  
  // Get donor users (MEMBER role) - now we have 10 donors
  const donors = users.filter(user => user.role === USER_ROLE.MEMBER);
  console.log(`🔍 Found ${donors.length} donors for registrations`);
  
  if (donors.length === 0) {
    console.error('❌ No donors found! Cannot create registrations.');
    return [];
  }
  
  // Get tomorrow and day after tomorrow dates
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0); // 9:00 AM
  
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(10, 0, 0, 0); // 10:00 AM

  console.log(`📅 Tomorrow: ${tomorrow.toISOString()}`);
  console.log(`📅 Day after tomorrow: ${dayAfterTomorrow.toISOString()}`);

  // Debug facility information
  console.log(`🏥 Facility 1 (Chợ Rẫy): ${facilities[0].name} - ID: ${facilities[0]._id}`);
  console.log(`🏥 Facility 2 (Viện Huyết học): ${facilities[1].name} - ID: ${facilities[1]._id}`);

  // Get nurse staff for assignment
  const nurseStaffFacility1 = facilityStaff.filter(staff => 
    staff.position === STAFF_POSITION.NURSE && 
    staff.facilityId.toString() === facilities[0]._id.toString()
  );
  const nurseStaffFacility2 = facilityStaff.filter(staff => 
    staff.position === STAFF_POSITION.NURSE && 
    staff.facilityId.toString() === facilities[1]._id.toString()
  );

  console.log(`👨‍⚕️ Nurse staff facility 1: ${nurseStaffFacility1.length}`);
  console.log(`👨‍⚕️ Nurse staff facility 2: ${nurseStaffFacility2.length}`);

  // Create 10 registrations for tomorrow
  // 8 registrations for Facility 1 (Chợ Rẫy) - Focus on this facility
  console.log('🏥 Creating registrations for tomorrow - Facility 1 (Chợ Rẫy)...');
  for (let i = 0; i < 8; i++) {
    const donor = donors[i];
    const preferredDate = new Date(tomorrow);
    preferredDate.setHours(8 + i, 0, 0, 0); // Different time slots from 8:00 to 15:00

    const registration = {
      userId: donor._id,
      facilityId: facilities[0]._id,
      bloodGroupId: donor.bloodId,
      staffId: nurseStaffFacility1[i % nurseStaffFacility1.length]._id,
      preferredDate: preferredDate,
      status: BLOOD_DONATION_REGISTRATION_STATUS.PENDING_APPROVAL,
      source: i % 3 === 0 ? BLOOD_DONATION_REGISTRATION_SOURCE.REQUEST : BLOOD_DONATION_REGISTRATION_SOURCE.VOLUNTARY,
      expectedQuantity: 450,
      notes: `Đăng ký hiến máu từ ${donor.fullName} - ${i % 2 === 0 ? 'Lần đầu hiến máu' : 'Đã hiến máu trước đây'}`,
      location: {
        type: 'Point',
        coordinates: [106.6583, 10.7554] // Chợ Rẫy coordinates
      }
    };

    registrations.push(registration);
    console.log(`  ✅ Registration ${i + 1}: ${donor.fullName} at ${preferredDate.toLocaleTimeString()} - Facility: ${facilities[0].name} (${facilities[0]._id})`);
  }

  // 2 registrations for Facility 2 (Viện Huyết học HCM)
  console.log('🏥 Creating registrations for tomorrow - Facility 2 (Viện Huyết học)...');
  for (let i = 8; i < 10; i++) {
    const donor = donors[i];
    const preferredDate = new Date(tomorrow);
    preferredDate.setHours(14 + (i-8), 0, 0, 0); // Afternoon slots

    const registration = {
      userId: donor._id,
      facilityId: facilities[1]._id,
      bloodGroupId: donor.bloodId,
      staffId: nurseStaffFacility2[(i-8) % nurseStaffFacility2.length]._id,
      preferredDate: preferredDate,
      status: BLOOD_DONATION_REGISTRATION_STATUS.PENDING_APPROVAL,
      source: BLOOD_DONATION_REGISTRATION_SOURCE.VOLUNTARY,
      expectedQuantity: 450,
      notes: `Đăng ký hiến máu từ ${donor.fullName} - Tại Viện Huyết học`,
      location: {
        type: 'Point',
        coordinates: [106.6544, 10.7614] // Viện Huyết học HCM coordinates
      }
    };

    registrations.push(registration);
    console.log(`  ✅ Registration ${i + 1}: ${donor.fullName} at ${preferredDate.toLocaleTimeString()} - Facility: ${facilities[1].name} (${facilities[1]._id})`);
  }

  // Create 10 registrations for day after tomorrow
  // 8 registrations for Facility 1 (Chợ Rẫy) - Focus on this facility
  console.log('🏥 Creating registrations for day after tomorrow - Facility 1 (Chợ Rẫy)...');
  for (let i = 0; i < 8; i++) {
    const donor = donors[i];
    const preferredDate = new Date(dayAfterTomorrow);
    preferredDate.setHours(9 + i, 30, 0, 0); // Different time slots from 9:30 to 16:30

    const registration = {
      userId: donor._id,
      facilityId: facilities[0]._id,
      bloodGroupId: donor.bloodId,
      staffId: nurseStaffFacility1[i % nurseStaffFacility1.length]._id,
      preferredDate: preferredDate,
      status: BLOOD_DONATION_REGISTRATION_STATUS.PENDING_APPROVAL,
      source: i % 4 === 0 ? BLOOD_DONATION_REGISTRATION_SOURCE.REQUEST : BLOOD_DONATION_REGISTRATION_SOURCE.VOLUNTARY,
      expectedQuantity: 450,
      notes: `Đăng ký hiến máu lần 2 từ ${donor.fullName} - ${Math.random() > 0.5 ? 'Hiến máu định kỳ' : 'Hiến máu khẩn cấp'}`,
      location: {
        type: 'Point',
        coordinates: [106.6583, 10.7554] // Chợ Rẫy coordinates
      }
    };

    registrations.push(registration);
    console.log(`  ✅ Registration ${i + 11}: ${donor.fullName} at ${preferredDate.toLocaleTimeString()} - Facility: ${facilities[0].name} (${facilities[0]._id})`);
  }

  // 2 registrations for Facility 2 (Viện Huyết học HCM)
  console.log('🏥 Creating registrations for day after tomorrow - Facility 2 (Viện Huyết học)...');
  for (let i = 8; i < 10; i++) {
    const donor = donors[i];
    const preferredDate = new Date(dayAfterTomorrow);
    preferredDate.setHours(10 + (i-8) * 2, 0, 0, 0); // Morning slots

    const registration = {
      userId: donor._id,
      facilityId: facilities[1]._id,
      bloodGroupId: donor.bloodId,
      staffId: nurseStaffFacility2[(i-8) % nurseStaffFacility2.length]._id,
      preferredDate: preferredDate,
      status: BLOOD_DONATION_REGISTRATION_STATUS.PENDING_APPROVAL,
      source: BLOOD_DONATION_REGISTRATION_SOURCE.VOLUNTARY,
      expectedQuantity: 450,
      notes: `Đăng ký hiến máu lần 2 từ ${donor.fullName} - Tại Viện Huyết học`,
      location: {
        type: 'Point',
        coordinates: [106.6544, 10.7614] // Viện Huyết học HCM coordinates
      }
    };

    registrations.push(registration);
    console.log(`  ✅ Registration ${i + 11}: ${donor.fullName} at ${preferredDate.toLocaleTimeString()} - Facility: ${facilities[1].name} (${facilities[1]._id})`);
  }

  console.log(`📝 Total registrations to create: ${registrations.length}`);

  try {
    const createdRegistrations = [];
    
    console.log('🔄 Creating registrations one by one to ensure unique codes...');
    for (let i = 0; i < registrations.length; i++) {
      const registrationData = registrations[i];
      try {
        const createdRegistration = await BloodDonationRegistration.create(registrationData);
        createdRegistrations.push(createdRegistration);
        console.log(`  ✅ Created registration ${i + 1}/${registrations.length}: ${createdRegistration.code}`);
      } catch (error) {
        console.error(`  ❌ Failed to create registration ${i + 1}:`, error.message);
        throw error;
      }
    }
    
    console.log(`✅ Successfully created ${createdRegistrations.length} blood donation registrations`);
    console.log(`   - Tomorrow: 10 registrations (8 for Chợ Rẫy, 2 for Viện Huyết học)`);
    console.log(`   - Day after tomorrow: 10 registrations (8 for Chợ Rẫy, 2 for Viện Huyết học)`);
    return createdRegistrations;
  } catch (error) {
    console.error('❌ Error creating registrations:', error);
    throw error;
  }
}

async function verifyData() {
  try {
    console.log('\n🔍 Verifying seeded data...');
    
    // Check facilities
    const facilities = await Facility.find().select('_id name code');
    console.log(`📍 Facilities found: ${facilities.length}`);
    facilities.forEach((facility, index) => {
      console.log(`   ${index + 1}. ${facility.name} (${facility.code}) - ID: ${facility._id}`);
    });
    
    // Check registrations and their facility mapping
    const registrations = await BloodDonationRegistration.find()
      .populate('facilityId', 'name code')
      .populate('userId', 'fullName')
      .select('code facilityId userId preferredDate');
    
    console.log(`📝 Registrations found: ${registrations.length}`);
    
    // Group by facility
    const registrationsByFacility = {};
    registrations.forEach(reg => {
      const facilityName = reg.facilityId.name;
      if (!registrationsByFacility[facilityName]) {
        registrationsByFacility[facilityName] = [];
      }
      registrationsByFacility[facilityName].push(reg);
    });
    
    Object.keys(registrationsByFacility).forEach(facilityName => {
      const count = registrationsByFacility[facilityName].length;
      console.log(`   📍 ${facilityName}: ${count} registrations`);
    });

    // Check blood donations
    const bloodDonations = await BloodDonation.find()
      .populate('userId', 'fullName')
      .populate({
        path: 'staffId',
        select: 'facilityId',
        populate: {
          path: 'facilityId',
          select: 'name'
        }
      })
      .select('userId staffId status donationDate quantity code');
    console.log(`🩸 Blood Donations found: ${bloodDonations.length}`);
    
    const donationsByStatus = {};
    bloodDonations.forEach(donation => {
      if (!donationsByStatus[donation.status]) {
        donationsByStatus[donation.status] = 0;
      }
      donationsByStatus[donation.status]++;
    });
    
    Object.keys(donationsByStatus).forEach(status => {
      console.log(`   📊 ${status}: ${donationsByStatus[status]} donations`);
    });
    
    // Group by facility through staffId
    const donationsByFacility = {};
    bloodDonations.forEach(donation => {
      if (donation.staffId && donation.staffId.facilityId) {
        const facilityName = donation.staffId.facilityId.name;
        if (!donationsByFacility[facilityName]) {
          donationsByFacility[facilityName] = 0;
        }
        donationsByFacility[facilityName]++;
      }
    });
    
    Object.keys(donationsByFacility).forEach(facilityName => {
      console.log(`   🏥 ${facilityName}: ${donationsByFacility[facilityName]} donations`);
    });

    // Check blood requests
    console.log('\n🩸 Verifying blood request data...');
    const bloodRequests = await BloodRequest.find()
      .populate('userId', 'fullName')
      .populate('facilityId', 'name')
      .populate('groupId', 'name')
      .populate('componentId', 'name')
      .select('userId facilityId groupId componentId status isUrgent quantity needsSupport isFulfilled');
    console.log(`🩸 Blood Requests found: ${bloodRequests.length}`);
    
    // Group by facility
    const requestsByFacility = {};
    bloodRequests.forEach(req => {
      const facilityName = req.facilityId.name;
      if (!requestsByFacility[facilityName]) {
        requestsByFacility[facilityName] = [];
      }
      requestsByFacility[facilityName].push(req);
    });
    
    Object.keys(requestsByFacility).forEach(facilityName => {
      const count = requestsByFacility[facilityName].length;
      console.log(`   🏥 ${facilityName}: ${count} requests`);
    });
    
    // Group by status
    const requestsByStatus = {};
    bloodRequests.forEach(req => {
      if (!requestsByStatus[req.status]) {
        requestsByStatus[req.status] = 0;
      }
      requestsByStatus[req.status]++;
    });
    
    Object.keys(requestsByStatus).forEach(status => {
      console.log(`   📊 ${status}: ${requestsByStatus[status]} requests`);
    });
    
    // Check urgent requests
    const urgentRequests = bloodRequests.filter(req => req.isUrgent);
    console.log(`   🚨 Urgent requests: ${urgentRequests.length}`);
    
    // Check requests needing support
    const requestsNeedingSupport = bloodRequests.filter(req => req.needsSupport);
    console.log(`   🤝 Requests needing support: ${requestsNeedingSupport.length}`);
    
    // Check blood request supports
    const bloodRequestSupports = await BloodRequestSupport.find()
      .populate('requestId', 'status')
      .populate('userId', 'fullName')
      .select('requestId userId status');
    console.log(`🤝 Blood Request Supports found: ${bloodRequestSupports.length}`);
    
    // Group supports by status
    const supportsByStatus = {};
    bloodRequestSupports.forEach(support => {
      if (!supportsByStatus[support.status]) {
        supportsByStatus[support.status] = 0;
      }
      supportsByStatus[support.status]++;
    });
    
    Object.keys(supportsByStatus).forEach(status => {
      console.log(`   📊 Support ${status}: ${supportsByStatus[status]} supports`);
    });

    // Check gift management data
    console.log('\n🎁 Verifying gift management data...');
    
    // Check gift items
    const giftItems = await GiftItem.find().select('name category isActive');
    console.log(`🎯 Gift Items found: ${giftItems.length}`);
    const itemsByCategory = {};
    giftItems.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = 0;
      }
      itemsByCategory[item.category]++;
    });
    Object.keys(itemsByCategory).forEach(category => {
      console.log(`   📦 ${category}: ${itemsByCategory[category]} items`);
    });
    
    // Check gift packages
    const giftPackages = await GiftPackage.find()
      .populate('createdBy', 'facilityId')
      .select('name items quantity availableQuantity priority isActive');
    console.log(`📦 Gift Packages found: ${giftPackages.length}`);
    
    // Group packages by facility and show quantity info
    const packagesByFacility = {};
    let totalPackageQuantity = 0;
    giftPackages.forEach(pkg => {
      const facilityId = pkg.createdBy?.facilityId?.toString() || 'Unknown';
      if (!packagesByFacility[facilityId]) {
        packagesByFacility[facilityId] = { packages: [], totalQuantity: 0 };
      }
      packagesByFacility[facilityId].packages.push(pkg);
      packagesByFacility[facilityId].totalQuantity += pkg.quantity || 0;
      totalPackageQuantity += pkg.quantity || 0;
    });
    
    console.log(`   📊 Total package quantity across all facilities: ${totalPackageQuantity}`);
    Object.keys(packagesByFacility).forEach(facilityId => {
      const data = packagesByFacility[facilityId];
      console.log(`   🏥 Facility ${facilityId}: ${data.packages.length} package types, ${data.totalQuantity} total packages`);
      data.packages.forEach(pkg => {
        console.log(`     - ${pkg.name}: ${pkg.quantity} packages (available: ${pkg.availableQuantity || pkg.quantity})`);
      });
    });
    
    // Check gift inventories
    const giftInventories = await GiftInventory.find()
      .populate('facilityId', 'name')
      .populate('giftItemId', 'name')
      .select('facilityId giftItemId quantity');
    console.log(`🏪 Gift Inventories found: ${giftInventories.length}`);
    
    // Group inventories by facility
    const inventoriesByFacility = {};
    giftInventories.forEach(inv => {
      const facilityName = inv.facilityId.name;
      if (!inventoriesByFacility[facilityName]) {
        inventoriesByFacility[facilityName] = [];
      }
      inventoriesByFacility[facilityName].push(inv);
    });
    
    Object.keys(inventoriesByFacility).forEach(facilityName => {
      const count = inventoriesByFacility[facilityName].length;
      const totalQuantity = inventoriesByFacility[facilityName].reduce((sum, inv) => sum + inv.quantity, 0);
      console.log(`   🏥 ${facilityName}: ${count} different items, ${totalQuantity} total quantity`);
    });
    
    // Check gift budgets
    const giftBudgets = await GiftBudget.find()
      .populate('facilityId', 'name')
      .select('facilityId budget spent');
    console.log(`💰 Gift Budgets found: ${giftBudgets.length}`);
    giftBudgets.forEach(budget => {
      const percentage = ((budget.spent / budget.budget) * 100).toFixed(1);
      console.log(`   🏥 ${budget.facilityId.name}: ${budget.budget.toLocaleString()} VND budget, ${budget.spent.toLocaleString()} VND spent (${percentage}%)`);
    });
    
    // Check gift logs
    const giftLogs = await GiftLog.find().select('action facilityId timestamp');
    console.log(`📋 Gift Logs found: ${giftLogs.length}`);
    const logsByAction = {};
    giftLogs.forEach(log => {
      if (!logsByAction[log.action]) {
        logsByAction[log.action] = 0;
      }
      logsByAction[log.action]++;
    });
    Object.keys(logsByAction).forEach(action => {
      console.log(`   📝 ${action}: ${logsByAction[action]} logs`);
    });
    
    // Check gift distributions
    const giftDistributions = await GiftDistribution.find()
      .populate('packageId', 'name')
      .populate('giftItemId', 'name')
      .populate('userId', 'fullName')
      .select('packageId giftItemId userId quantity distributedAt');
    console.log(`🎁 Gift Distributions found: ${giftDistributions.length}`);
    
    // Group distributions by type
    const packageDistributions = giftDistributions.filter(dist => dist.packageId);
    const individualDistributions = giftDistributions.filter(dist => !dist.packageId);
    
    console.log(`   📦 Package distributions: ${packageDistributions.length}`);
    console.log(`   🎯 Individual distributions: ${individualDistributions.length}`);
    
    if (packageDistributions.length > 0) {
      const packageGroups = {};
      packageDistributions.forEach(dist => {
        const packageName = dist.packageId.name;
        if (!packageGroups[packageName]) {
          packageGroups[packageName] = 0;
        }
        packageGroups[packageName]++;
      });
      Object.keys(packageGroups).forEach(packageName => {
        console.log(`     - ${packageName}: ${packageGroups[packageName]} item distributions`);
      });
    }
    
    console.log('✅ Data verification completed');
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  }
}

async function createGiftItems() {
  const giftItems = [
    // HEALTH category
    {
      name: 'Vitamin C Tablets',
      description: 'Viên uống Vitamin C tăng cường sức khỏe sau hiến máu',
      image: 'https://images.unsplash.com/photo-1550572017-edd951aa8462?w=400',
      unit: GIFT_ITEM_UNIT.BOX,
      category: GIFT_ITEM_CATEGORY.HEALTH,
      costPerUnit: 25000
    },
    {
      name: 'Iron Supplement',
      description: 'Viên bổ sung sắt giúp phục hồi sau hiến máu',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      unit: GIFT_ITEM_UNIT.BOX,
      category: GIFT_ITEM_CATEGORY.HEALTH,
      costPerUnit: 35000
    },
    {
      name: 'Multivitamin Complex',
      description: 'Tổng hợp vitamin và khoáng chất thiết yếu',
      image: 'https://images.unsplash.com/photo-1556228453-ecd73c6a1b75?w=400',
      unit: GIFT_ITEM_UNIT.BOX,
      category: GIFT_ITEM_CATEGORY.HEALTH,
      costPerUnit: 45000
    },

    // FOOD category
    {
      name: 'Protein Bar',
      description: 'Thanh protein dinh dưỡng cho người hiến máu',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      unit: GIFT_ITEM_UNIT.PACK,
      category: GIFT_ITEM_CATEGORY.FOOD,
      costPerUnit: 15000
    },
    {
      name: 'Nutrition Biscuits',
      description: 'Bánh quy dinh dưỡng cao cấp',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
      unit: GIFT_ITEM_UNIT.PACK,
      category: GIFT_ITEM_CATEGORY.FOOD,
      costPerUnit: 20000
    },
    {
      name: 'Energy Nuts Mix',
      description: 'Hỗn hợp hạt dinh dưỡng tăng năng lượng',
      image: 'https://images.unsplash.com/photo-1559656914-a30970c1affd?w=400',
      unit: GIFT_ITEM_UNIT.BAG,
      category: GIFT_ITEM_CATEGORY.FOOD,
      costPerUnit: 30000
    },

    // BEVERAGE category
    {
      name: 'Coconut Water',
      description: 'Nước dừa tươi bổ sung điện giải',
      image: 'https://images.unsplash.com/photo-1520342868574-5fa3804e551c?w=400',
      unit: GIFT_ITEM_UNIT.ITEM,
      category: GIFT_ITEM_CATEGORY.BEVERAGE,
      costPerUnit: 12000
    },
    {
      name: 'Orange Juice',
      description: 'Nước cam tươi giàu vitamin C',
      image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
      unit: GIFT_ITEM_UNIT.ITEM,
      category: GIFT_ITEM_CATEGORY.BEVERAGE,
      costPerUnit: 18000
    },
    {
      name: 'Sports Drink',
      description: 'Đồ uống thể thao bổ sung điện giải',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
      unit: GIFT_ITEM_UNIT.ITEM,
      category: GIFT_ITEM_CATEGORY.BEVERAGE,
      costPerUnit: 22000
    },

    // MERCHANDISE category
    {
      name: 'Blood Donor T-shirt',
      description: 'Áo thun cotton in logo người hiến máu',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      unit: GIFT_ITEM_UNIT.ITEM,
      category: GIFT_ITEM_CATEGORY.MERCHANDISE,
      costPerUnit: 85000
    },
    {
      name: 'Insulated Water Bottle',
      description: 'Bình nước giữ nhiệt thương hiệu hiến máu',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
      unit: GIFT_ITEM_UNIT.ITEM,
      category: GIFT_ITEM_CATEGORY.MERCHANDISE,
      costPerUnit: 120000
    },
    {
      name: 'Eco-friendly Tote Bag',
      description: 'Túi vải canvas thân thiện môi trường',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      unit: GIFT_ITEM_UNIT.ITEM,
      category: GIFT_ITEM_CATEGORY.MERCHANDISE,
      costPerUnit: 65000
    },
    {
      name: 'Thank You Card',
      description: 'Thiệp cảm ơn người hiến máu',
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400',
      unit: GIFT_ITEM_UNIT.ITEM,
      category: GIFT_ITEM_CATEGORY.MERCHANDISE,
      costPerUnit: 8000
    },

    // OTHER category
    {
      name: 'Hand Sanitizer',
      description: 'Gel rửa tay khô kháng khuẩn',
      image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400',
      unit: GIFT_ITEM_UNIT.ITEM,
      category: GIFT_ITEM_CATEGORY.OTHER,
      costPerUnit: 15000
    },
    {
      name: 'Medical Face Mask',
      description: 'Khẩu trang y tế 3 lớp',
      image: 'https://images.unsplash.com/photo-1584634428647-dced00f83be5?w=400',
      unit: GIFT_ITEM_UNIT.PACK,
      category: GIFT_ITEM_CATEGORY.OTHER,
      costPerUnit: 25000
    }
  ];

  const createdGiftItems = await GiftItem.insertMany(giftItems);
  console.log(`✅ Created ${createdGiftItems.length} gift items`);
  return createdGiftItems;
}

async function createGiftPackages(giftItems, facilityStaff, facilities) {
  // Get manager staff for each facility
  const facility1Managers = facilityStaff.filter(staff => 
    staff.position === STAFF_POSITION.MANAGER && 
    staff.facilityId.toString() === facilities[0]._id.toString()
  );
  const facility2Managers = facilityStaff.filter(staff => 
    staff.position === STAFF_POSITION.MANAGER && 
    staff.facilityId.toString() === facilities[1]._id.toString()
  );

  const giftPackages = [
    // Packages for Facility 1 (Chợ Rẫy)
    {
      name: 'Gói Cảm Ơn Cơ Bản',
      description: 'Gói quà cảm ơn dành cho người hiến máu lần đầu',
      facilityId: facilities[0]._id,
      items: [
        { giftItemId: giftItems.find(item => item.name === 'Vitamin C Tablets')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Thank You Card')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Coconut Water')._id, quantity: 1 }
      ],
      quantity: 50, // 50 packages available
      createdBy: facility1Managers[0]._id,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      priority: 3
    },

    {
      name: 'Gói Sức Khỏe Premium',
      description: 'Gói quà cao cấp dành cho người hiến máu thường xuyên',
      facilityId: facilities[0]._id,
      items: [
        { giftItemId: giftItems.find(item => item.name === 'Multivitamin Complex')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Iron Supplement')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Protein Bar')._id, quantity: 2 },
        { giftItemId: giftItems.find(item => item.name === 'Blood Donor T-shirt')._id, quantity: 1 }
      ],
      quantity: 25, // 25 packages available (premium package, fewer quantity)
      createdBy: facility1Managers[0]._id,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      priority: 5
    },

    {
      name: 'Gói An Toàn Sức Khỏe',
      description: 'Gói quà chú trọng vệ sinh và an toàn sức khỏe',
      facilityId: facilities[0]._id,
      items: [
        { giftItemId: giftItems.find(item => item.name === 'Hand Sanitizer')._id, quantity: 2 },
        { giftItemId: giftItems.find(item => item.name === 'Medical Face Mask')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Vitamin C Tablets')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Coconut Water')._id, quantity: 1 }
      ],
      quantity: 40, // 40 packages available
      createdBy: facility1Managers[0]._id,
      image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400',
      priority: 1
    },

    {
      name: 'Gói Dinh Dưỡng Nhanh',
      description: 'Gói quà nhỏ gọn cho những lần hiến máu nhanh',
      facilityId: facilities[0]._id,
      items: [
        { giftItemId: giftItems.find(item => item.name === 'Nutrition Biscuits')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Orange Juice')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Thank You Card')._id, quantity: 1 }
      ],
      quantity: 75, // 75 packages available (basic package, more quantity)
      createdBy: facility1Managers[0]._id,
      image: 'https://images.unsplash.com/photo-1559656914-a30970c1affd?w=400',
      priority: 2
    },

    // Packages for Facility 2 (Viện Huyết học)
    {
      name: 'Gói Tăng Năng Lượng',
      description: 'Gói quà giúp phục hồi năng lượng nhanh sau hiến máu',
      facilityId: facilities[1]._id,
      items: [
        { giftItemId: giftItems.find(item => item.name === 'Sports Drink')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Energy Nuts Mix')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Nutrition Biscuits')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Vitamin C Tablets')._id, quantity: 1 }
      ],
      quantity: 35, // 35 packages available
      createdBy: facility2Managers[0]._id,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      priority: 4
    },

    {
      name: 'Gói Xanh Thân Thiện',
      description: 'Gói quà thân thiện với môi trường',
      facilityId: facilities[1]._id,
      items: [
        { giftItemId: giftItems.find(item => item.name === 'Insulated Water Bottle')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Eco-friendly Tote Bag')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Orange Juice')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Thank You Card')._id, quantity: 1 }
      ],
      quantity: 20, // 20 packages available (eco package with merchandise, fewer quantity)
      createdBy: facility2Managers[0]._id,
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
      priority: 2
    },

    {
      name: 'Gói Khởi Đầu Tốt',
      description: 'Gói quà đơn giản cho người hiến máu mới',
      facilityId: facilities[1]._id,
      items: [
        { giftItemId: giftItems.find(item => item.name === 'Coconut Water')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Protein Bar')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Hand Sanitizer')._id, quantity: 1 },
        { giftItemId: giftItems.find(item => item.name === 'Thank You Card')._id, quantity: 1 }
      ],
      quantity: 60, // 60 packages available (starter package, high quantity)
      createdBy: facility2Managers[0]._id,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      priority: 3
    }
  ];

  const createdGiftPackages = await GiftPackage.insertMany(giftPackages);
  console.log(`✅ Created ${createdGiftPackages.length} gift packages with quantities`);
  console.log(`   📍 Facility 1 (Chợ Rẫy): 4 packages`);
  console.log(`     - Gói Cảm Ơn Cơ Bản: 50 packages`);
  console.log(`     - Gói Sức Khỏe Premium: 25 packages`);
  console.log(`     - Gói An Toàn Sức Khỏe: 40 packages`);
  console.log(`     - Gói Dinh Dưỡng Nhanh: 75 packages`);
  console.log(`   📍 Facility 2 (Viện Huyết học): 3 packages`);
  console.log(`     - Gói Tăng Năng Lượng: 35 packages`);
  console.log(`     - Gói Xanh Thân Thiện: 20 packages`);
  console.log(`     - Gói Khởi Đầu Tốt: 60 packages`);
  
  return createdGiftPackages;
}

async function createGiftBudgets(facilities) {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1); // January 1st
  const endDate = new Date(currentYear, 11, 31); // December 31st

  const giftBudgets = [
    {
      facilityId: facilities[0]._id, // Chợ Rẫy
      budget: 50000000, // 50 million VND
      spent: 5000000,   // 5 million VND spent
      startDate,
      endDate
    },
    {
      facilityId: facilities[1]._id, // Viện Huyết học
      budget: 30000000, // 30 million VND  
      spent: 3000000,   // 3 million VND spent
      startDate,
      endDate
    }
  ];

  const createdGiftBudgets = await GiftBudget.insertMany(giftBudgets);
  console.log(`✅ Created ${createdGiftBudgets.length} gift budgets`);
  return createdGiftBudgets;
}

async function createGiftInventories(giftItems, facilities) {
  const giftInventories = [];

  // Create inventory for both facilities
  for (const facility of facilities) {
    for (const giftItem of giftItems) {
      // Different stock levels for different facilities
      const isMainFacility = facility.code === 'CR_BLOOD_001'; // Chợ Rẫy
      const baseQuantity = isMainFacility ? 200 : 150;
      
      // Vary quantities based on item category
      let quantity = baseQuantity;
      let minStockLevel = 20;
      
      switch (giftItem.category) {
        case GIFT_ITEM_CATEGORY.HEALTH:
          quantity = baseQuantity + 50;
          minStockLevel = 30;
          break;
        case GIFT_ITEM_CATEGORY.BEVERAGE:
          quantity = baseQuantity + 100;
          minStockLevel = 40;
          break;
        case GIFT_ITEM_CATEGORY.FOOD:
          quantity = baseQuantity + 75;
          minStockLevel = 25;
          break;
        case GIFT_ITEM_CATEGORY.MERCHANDISE:
          quantity = Math.floor(baseQuantity / 2);
          minStockLevel = 15;
          break;
        case GIFT_ITEM_CATEGORY.OTHER:
          quantity = baseQuantity + 25;
          minStockLevel = 20;
          break;
      }

      giftInventories.push({
        facilityId: facility._id,
        giftItemId: giftItem._id,
        quantity,
        reservedQuantity: Math.floor(Math.random() * 10), // Random reserved 0-9
        costPerUnit: giftItem.costPerUnit,
        minStockLevel,
        lastStockDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });
    }
  }

  const createdGiftInventories = await GiftInventory.insertMany(giftInventories);
  console.log(`✅ Created ${createdGiftInventories.length} gift inventory records`);
  return createdGiftInventories;
}

async function createGiftLogs(giftItems, giftPackages, facilities, facilityStaff) {
  const giftLogs = [];
  
  // Get manager staff for logging
  const managers = facilityStaff.filter(staff => staff.position === STAFF_POSITION.MANAGER);
  
  // Create some sample logs for the past week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  // Stock in logs
  for (let i = 0; i < 10; i++) {
    const randomGiftItem = giftItems[Math.floor(Math.random() * giftItems.length)];
    const randomFacility = facilities[Math.floor(Math.random() * facilities.length)];
    const randomManager = managers.find(m => m.facilityId.toString() === randomFacility._id.toString());
    
    if (randomManager) {
      giftLogs.push({
        facilityId: randomFacility._id,
        giftItemId: randomGiftItem._id,
        action: GIFT_ACTION.STOCK_IN,
        userId: randomManager._id,
        details: {
          name: randomGiftItem.name,
          quantity: Math.floor(Math.random() * 100) + 50,
          costPerUnit: randomGiftItem.costPerUnit,
          totalCost: (Math.floor(Math.random() * 100) + 50) * randomGiftItem.costPerUnit
        },
        timestamp: new Date(oneWeekAgo.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
    }
  }

  // Package creation logs
  for (const giftPackage of giftPackages) {
    const facilityManager = managers.find(m => m._id.toString() === giftPackage.createdBy.toString());
    if (facilityManager) {
      giftLogs.push({
        facilityId: facilityManager.facilityId,
        packageId: giftPackage._id,
        action: GIFT_ACTION.CREATE_PACKAGE,
        userId: facilityManager._id,
        details: {
          name: giftPackage.name,
          quantity: giftPackage.quantity,
          itemCount: giftPackage.items.length,
          items: giftPackage.items.map(item => ({
            giftItemId: item.giftItemId,
            quantity: item.quantity
          }))
        },
        timestamp: new Date(oneWeekAgo.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
    }
  }

  // Budget update logs
  for (const facility of facilities) {
    const facilityManager = managers.find(m => m.facilityId.toString() === facility._id.toString());
    if (facilityManager) {
      giftLogs.push({
        facilityId: facility._id,
        action: GIFT_ACTION.UPDATE_BUDGET,
        userId: facilityManager._id,
        details: {
          budget: facility.code === 'CR_BLOOD_001' ? 50000000 : 30000000,
          startDate: new Date(new Date().getFullYear(), 0, 1),
          endDate: new Date(new Date().getFullYear(), 11, 31)
        },
        timestamp: new Date(oneWeekAgo.getTime() + Math.random() * 24 * 60 * 60 * 1000)
      });
    }
  }

  const createdGiftLogs = await GiftLog.insertMany(giftLogs);
  console.log(`✅ Created ${createdGiftLogs.length} gift log entries`);
  return createdGiftLogs;
}

async function createContentCategories() {
  const contentCategories = [
    {
      name: 'Tin tức',
      description: 'Tin tức và thông báo về hoạt động hiến máu'
    },
    {
      name: 'Hướng dẫn',
      description: 'Hướng dẫn quy trình và thủ tục hiến máu'
    },
    {
      name: 'Sức khỏe',
      description: 'Thông tin về sức khỏe và chăm sóc sau hiến máu'
    },
    {
      name: 'Câu chuyện',
      description: 'Câu chuyện cảm động từ người hiến máu và người nhận'
    },
    {
      name: 'Sự kiện',
      description: 'Thông tin về các sự kiện và chiến dịch hiến máu'
    }
  ];

  const createdContentCategories = await ContentCategory.insertMany(contentCategories);
  console.log(`✅ Created ${createdContentCategories.length} content categories`);
  return createdContentCategories;
}

async function createContentData(users, facilities, facilityStaff, contentCategories) {
  const contents = [];
  
  // Get admin users and facility managers
  const admins = users.filter(user => user.role === USER_ROLE.ADMIN);
  const managers = facilityStaff.filter(staff => staff.position === STAFF_POSITION.MANAGER);
  
  console.log(`📝 Creating content data...`);
  console.log(`   👤 Found ${admins.length} admin users`);
  console.log(`   👨‍💼 Found ${managers.length} facility managers`);
  
  // Create 2 system-wide content by Admin
  const systemContents = [
    {
      type: 'blog',
      categoryId: contentCategories.find(cat => cat.name === 'Tin tức')._id,
      facilityId: null, // System-wide content
      title: 'Tầm quan trọng của việc hiến máu trong cộng đồng',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
      content: `
        <h2>Hiến máu - Hành động nhân văn cao đẹp</h2>
        <p>Hiến máu là một trong những hành động nhân văn cao đẹp nhất mà mỗi người có thể thực hiện để cứu sống những người khác. Mỗi đơn vị máu hiến tặng có thể cứu sống tới 3 người bệnh.</p>
        
        <h3>Lợi ích của việc hiến máu:</h3>
        <ul>
          <li>Giúp cứu sống những người bệnh cần truyền máu khẩn cấp</li>
          <li>Tốt cho sức khỏe của người hiến máu</li>
          <li>Tạo ra nguồn máu dự trữ cho cộng đồng</li>
          <li>Thể hiện tinh thần tương thân tương ái</li>
        </ul>
        
        <h3>Ai có thể hiến máu?</h3>
        <p>Người từ 18-60 tuổi, có sức khỏe tốt, cân nặng từ 45kg trở lên và không mắc các bệnh lý nguy hiểm có thể tham gia hiến máu.</p>
        
        <p>Hãy cùng chung tay xây dựng một cộng đồng khỏe mạnh và nhân ái thông qua việc hiến máu tình nguyện!</p>
      `,
      summary: 'Hiến máu là hành động nhân văn cao đẹp, mang lại nhiều lợi ích cho cả người hiến và người nhận. Mỗi đơn vị máu có thể cứu sống tới 3 người bệnh.',
      authorId: admins[0]._id,
      status: CONTENT_STATUS.PUBLISHED
    },
    {
      type: 'document',
      categoryId: contentCategories.find(cat => cat.name === 'Hướng dẫn')._id,
      facilityId: null, // System-wide content
      title: 'Quy trình hiến máu an toàn - Hướng dẫn chi tiết',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
      content: `
        <h2>Quy trình hiến máu an toàn</h2>
        <p>Để đảm bảo an toàn cho cả người hiến máu và người nhận máu, chúng tôi áp dụng quy trình hiến máu nghiêm ngặt theo tiêu chuẩn quốc tế.</p>
        
        <h3>Bước 1: Đăng ký và kiểm tra thông tin</h3>
        <ul>
          <li>Điền đầy đủ thông tin cá nhân</li>
          <li>Xuất trình giấy tờ tùy thân</li>
          <li>Trả lời bảng câu hỏi sức khỏe</li>
        </ul>
        
        <h3>Bước 2: Khám sàng lọc</h3>
        <ul>
          <li>Đo huyết áp, cân nặng, chiều cao</li>
          <li>Kiểm tra mức hemoglobin</li>
          <li>Khám lâm sàng tổng quát</li>
        </ul>
        
        <h3>Bước 3: Hiến máu</h3>
        <ul>
          <li>Sử dụng dụng cụ vô trùng, một lần duy nhất</li>
          <li>Lấy 350-450ml máu (tùy theo cân nặng)</li>
          <li>Thời gian hiến máu: 8-10 phút</li>
        </ul>
        
        <h3>Bước 4: Nghỉ ngơi và chăm sóc sau hiến máu</h3>
        <ul>
          <li>Nghỉ ngơi 10-15 phút</li>
          <li>Uống nước và ăn nhẹ</li>
          <li>Nhận quà cảm ơn và giấy chứng nhận</li>
        </ul>
        
        <h3>Lưu ý quan trọng:</h3>
        <p>Sau khi hiến máu, bạn nên:</p>
        <ul>
          <li>Uống nhiều nước trong 24h đầu</li>
          <li>Tránh hoạt động nặng trong 24h</li>
          <li>Không uống rượu bia trong 24h</li>
          <li>Liên hệ ngay nếu có triệu chứng bất thường</li>
        </ul>
      `,
      summary: 'Hướng dẫn chi tiết quy trình hiến máu an toàn gồm 4 bước: đăng ký, khám sàng lọc, hiến máu và chăm sóc sau hiến máu.',
      authorId: admins[1]._id,
      status: CONTENT_STATUS.PUBLISHED
    }
  ];
  
  // Add system contents to array
  contents.push(...systemContents);
  console.log(`   📄 Created 2 system-wide contents by Admin`);
  
  // Create 2 facility-specific content for each facility by their managers
  for (let facilityIndex = 0; facilityIndex < facilities.length; facilityIndex++) {
    const facility = facilities[facilityIndex];
    const facilityManager = managers.find(m => m.facilityId.toString() === facility._id.toString());
    
    if (facilityManager) {
      console.log(`   🏥 Creating content for ${facility.name} by manager ${facilityManager._id}`);
      
      const facilityContents = [
        {
          type: 'introduction',
          categoryId: contentCategories.find(cat => cat.name === 'Sự kiện')._id,
          facilityId: facility._id,
          title: `Giới thiệu về ${facility.name}`,
          image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800',
          content: `
            <h2>Chào mừng đến với ${facility.name}</h2>
            <p>Chúng tôi tự hào là một trong những cơ sở y tế hàng đầu trong lĩnh vực hiến máu và truyền máu tại TP.HCM.</p>
            
            <h3>Thông tin liên hệ:</h3>
            <ul>
              <li><strong>Địa chỉ:</strong> ${facility.address}</li>
              <li><strong>Điện thoại:</strong> ${facility.contactPhone}</li>
              <li><strong>Email:</strong> ${facility.contactEmail}</li>
            </ul>
            
            <h3>Giờ làm việc:</h3>
            <ul>
              <li>Thứ 2 - Thứ 6: 7:00 - 17:00</li>
              <li>Thứ 7: 7:00 - 12:00</li>
              <li>Chủ nhật: Nghỉ</li>
            </ul>
            
            <h3>Dịch vụ của chúng tôi:</h3>
            <ul>
              <li>Hiến máu tình nguyện</li>
              <li>Hiến máu theo yêu cầu</li>
              <li>Xét nghiệm máu</li>
              <li>Tư vấn sức khỏe</li>
              <li>Cấp cứu truyền máu 24/7</li>
            </ul>
            
            <p>Đội ngũ y bác sĩ giàu kinh nghiệm của chúng tôi luôn sẵn sàng phục vụ và đảm bảo an toàn tuyệt đối cho mọi người hiến máu.</p>
          `,
          summary: `Giới thiệu về ${facility.name} - cơ sở y tế hàng đầu trong lĩnh vực hiến máu và truyền máu tại TP.HCM với đội ngũ chuyên nghiệp.`,
          authorId: facilityManager._id,
          status: CONTENT_STATUS.PUBLISHED
        },
        {
          type: 'blog',
          categoryId: contentCategories.find(cat => cat.name === 'Câu chuyện')._id,
          facilityId: facility._id,
          title: `Câu chuyện cảm động tại ${facility.name}`,
          image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800',
          content: `
            <h2>Những câu chuyện cảm động từ ${facility.name}</h2>
            <p>Mỗi ngày, chúng tôi chứng kiến rất nhiều câu chuyện cảm động về tình người và sự chia sẻ của các tình nguyện viên hiến máu.</p>
            
            <h3>Câu chuyện của anh Minh - Người hiến máu 50 lần</h3>
            <p>Anh Nguyễn Văn Minh, 45 tuổi, đã hiến máu 50 lần tại cơ sở của chúng tôi. "Mỗi lần hiến máu, tôi nghĩ đến những người bệnh đang cần được cứu sống. Đó là động lực để tôi tiếp tục hành trình này", anh Minh chia sẻ.</p>
            
            <h3>Câu chuyện của em Hoa - Sinh viên năm nhất</h3>
            <p>Em Trần Thị Hoa, sinh viên năm nhất, lần đầu hiến máu vào ngày sinh nhật 18 tuổi. "Em muốn làm điều gì đó ý nghĩa trong ngày đặc biệt này. Hiến máu là cách em góp phần giúp đỡ cộng đồng", em Hoa nói.</p>
            
            <h3>Gia đình hiến máu 3 thế hệ</h3>
            <p>Gia đình ông Trần Văn Nam có truyền thống hiến máu từ ông, bố đến con. "Hiến máu không chỉ là việc làm tốt mà còn là cách giáo dục con em về lòng nhân ái", ông Nam chia sẻ.</p>
            
            <p>Những câu chuyện này là nguồn động viên lớn cho đội ngũ y bác sĩ của chúng tôi, đồng thời truyền cảm hứng cho nhiều người khác tham gia hiến máu tình nguyện.</p>
            
            <blockquote>
              <p>"Hiến máu là cho đi để nhận lại. Cho đi tình yêu thương, nhận lại niềm hạnh phúc." - Một tình nguyện viên hiến máu</p>
            </blockquote>
          `,
          summary: `Những câu chuyện cảm động từ các tình nguyện viên hiến máu tại ${facility.name}, thể hiện tinh thần tương thân tương ái và lòng nhân ái của cộng đồng.`,
          authorId: facilityManager._id,
          status: CONTENT_STATUS.PUBLISHED
        }
      ];
      
      contents.push(...facilityContents);
      console.log(`     ✅ Created 2 contents for ${facility.name}`);
    }
  }
  
  // Create content records one by one to trigger pre-save middleware for slug generation
  const createdContents = [];
  console.log(`🔄 Creating ${contents.length} content records one by one...`);
  
  for (let i = 0; i < contents.length; i++) {
    try {
      const content = await Content.create(contents[i]);
      createdContents.push(content);
      console.log(`  ✅ Created content ${i + 1}/${contents.length}: "${content.title}" (${content.slug})`);
    } catch (error) {
      console.error(`  ❌ Error creating content ${i + 1}:`, error.message);
      throw error;
    }
  }
  
  console.log(`✅ Created ${createdContents.length} content records`);
  console.log(`   📄 System-wide contents: ${createdContents.filter(c => c.facilityId === null).length}`);
  console.log(`   🏥 Facility-specific contents: ${createdContents.filter(c => c.facilityId !== null).length}`);
  
  // Log content by facility
  for (const facility of facilities) {
    const facilityContents = createdContents.filter(c => c.facilityId && c.facilityId.toString() === facility._id.toString());
    console.log(`     - ${facility.name}: ${facilityContents.length} contents`);
  }
  
  return createdContents;
}

async function createCompletedBloodDonations(users, facilities, bloodGroups, facilityStaff) {
  const donors = users.filter(user => user.role === USER_ROLE.MEMBER);
  const nurses = facilityStaff.filter(staff => staff.position === STAFF_POSITION.NURSE);
  
  const createdDonations = [];
  
  // Create completed donations for the first 6 donors (we'll use these for gift distributions)
  for (let i = 0; i < 6; i++) {
    const donor = donors[i];
    const facility = facilities[i % 2]; // Alternate between facilities
    const nurse = nurses.find(n => n.facilityId.toString() === facility._id.toString());
    
    if (donor && nurse) {
      // Create donation from 2-7 days ago (completed)
      const donationDate = new Date(Date.now() - (2 + i) * 24 * 60 * 60 * 1000);
      
      try {
        const donation = new BloodDonation({
          userId: donor._id,
          bloodGroupId: donor.bloodId,
          quantity: 450, // Standard donation amount
          donationDate,
          status: BLOOD_DONATION_STATUS.COMPLETED,
          bloodDonationRegistrationId: null, // Can be null for walk-in donations
          createdBy: nurse._id,
          staffId: nurse._id,
          notes: `Completed blood donation from ${donor.fullName} - ${donationDate.toDateString()}`
        });
        
        const savedDonation = await donation.save(); // This will trigger pre-save middleware to generate unique code
        createdDonations.push(savedDonation);
        console.log(`  ✅ Created donation ${i + 1}/6: ${savedDonation.code} for ${donor.fullName}`);
      } catch (error) {
        console.error(`  ❌ Error creating donation ${i + 1}:`, error.message);
        throw error;
      }
    }
  }
  
  console.log(`✅ Created ${createdDonations.length} completed blood donations for gift distribution testing`);
  return createdDonations;
}

async function createSampleGiftDistributions(giftPackages, giftItems, users, facilityStaff, facilities, bloodDonations) {
  const giftDistributions = [];
  
  // Get donor users and nurse staff
  const donors = users.filter(user => user.role === USER_ROLE.MEMBER);
  const nurses = facilityStaff.filter(staff => staff.position === STAFF_POSITION.NURSE);
  
  // Create some sample distributions from the past week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  // Distribute some packages (only 3 to preserve quantities for testing)
  const packagesToDistribute = [
    { packageIndex: 0, donationIndex: 0, facilityIndex: 0 }, // Gói Cảm Ơn Cơ Bản
    { packageIndex: 2, donationIndex: 1, facilityIndex: 0 }, // Gói An Toàn Sức Khỏe
    { packageIndex: 4, donationIndex: 2, facilityIndex: 1 }, // Gói Tăng Năng Lượng
  ];
  
  for (const distConfig of packagesToDistribute) {
    const giftPackage = giftPackages[distConfig.packageIndex];
    const bloodDonation = bloodDonations[distConfig.donationIndex];
    const facility = facilities[distConfig.facilityIndex];
    const nurse = nurses.find(n => n.facilityId.toString() === facility._id.toString());
    
    if (giftPackage && bloodDonation && nurse) {
      // Create distribution records for each item in the package
      for (const packageItem of giftPackage.items) {
        giftDistributions.push({
          facilityId: facility._id,
          giftItemId: packageItem.giftItemId,
          userId: bloodDonation.userId,
          donationId: bloodDonation._id, // Use real donation ID
          packageId: giftPackage._id,
          quantity: packageItem.quantity,
          costPerUnit: giftItems.find(item => item._id.toString() === packageItem.giftItemId.toString())?.costPerUnit || 0,
          distributedBy: nurse._id,
          distributedAt: new Date(oneWeekAgo.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
          notes: `Phân phát gói quà "${giftPackage.name}" cho donation ID: ${bloodDonation._id}`
        });
      }
    }
  }
  
  // Create some individual gift distributions
  const individualDistributions = [
    { giftItemName: 'Coconut Water', donationIndex: 3, facilityIndex: 1, quantity: 1 },
    { giftItemName: 'Vitamin C Tablets', donationIndex: 4, facilityIndex: 0, quantity: 1 },
    { giftItemName: 'Thank You Card', donationIndex: 5, facilityIndex: 1, quantity: 1 },
  ];
  
  for (const distConfig of individualDistributions) {
    const giftItem = giftItems.find(item => item.name === distConfig.giftItemName);
    const bloodDonation = bloodDonations[distConfig.donationIndex];
    const facility = facilities[distConfig.facilityIndex];
    const nurse = nurses.find(n => n.facilityId.toString() === facility._id.toString());
    
    if (giftItem && bloodDonation && nurse) {
      giftDistributions.push({
        facilityId: facility._id,
        giftItemId: giftItem._id,
        userId: bloodDonation.userId,
        donationId: bloodDonation._id, // Use real donation ID
        packageId: null, // Individual distribution
        quantity: distConfig.quantity,
        costPerUnit: giftItem.costPerUnit,
        distributedBy: nurse._id,
        distributedAt: new Date(oneWeekAgo.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        notes: `Phân phát đơn lẻ ${giftItem.name} cho donation ID: ${bloodDonation._id}`
      });
    }
  }
  
  if (giftDistributions.length > 0) {
    const createdDistributions = await GiftDistribution.insertMany(giftDistributions);
    console.log(`✅ Created ${createdDistributions.length} sample gift distributions`);
    console.log(`   📦 Package distributions: ${packagesToDistribute.length} packages`);
    console.log(`   🎁 Individual distributions: ${individualDistributions.length} items`);
    return createdDistributions;
  }
  
  return [];
}

async function createHealthChecks(registrations, facilityStaff) {
  const healthChecks = [];
  const doctors = facilityStaff.filter(staff => staff.position === STAFF_POSITION.DOCTOR);
  const nurses = facilityStaff.filter(staff => staff.position === STAFF_POSITION.NURSE);
  
  // Create health checks for registrations that are checked_in or beyond
  const eligibleRegistrations = registrations.filter(reg => 
    [BLOOD_DONATION_REGISTRATION_STATUS.CHECKED_IN, 
     BLOOD_DONATION_REGISTRATION_STATUS.IN_CONSULT,
     BLOOD_DONATION_REGISTRATION_STATUS.WAITING_DONATION,
     BLOOD_DONATION_REGISTRATION_STATUS.DONATING,
     BLOOD_DONATION_REGISTRATION_STATUS.DONATED,
     BLOOD_DONATION_REGISTRATION_STATUS.RESTING,
     BLOOD_DONATION_REGISTRATION_STATUS.POST_REST_CHECK,
     BLOOD_DONATION_REGISTRATION_STATUS.COMPLETED].includes(reg.status)
  );
  
  for (const registration of eligibleRegistrations) {
    const doctor = doctors.find(d => d.facilityId.toString() === registration.facilityId.toString());
    const nurse = nurses.find(n => n.facilityId.toString() === registration.facilityId.toString());
    
    if (doctor && nurse) {
      // Use createdAt instead of registrationDate
      const baseDate = registration.createdAt || new Date();
      
      // Determine eligibility based on random factors (90% eligible)
      const isEligible = Math.random() > 0.1;
      
      // Generate realistic health metrics
      const healthCheck = {
        registrationId: registration._id,
        userId: registration.userId,
        doctorId: doctor._id,
        staffId: nurse._id,
        facilityId: registration.facilityId,
        checkDate: new Date(baseDate.getTime() + Math.random() * 2 * 60 * 60 * 1000), // Within 2 hours of registration
        isEligible,
        bloodPressure: isEligible ? 
          `${110 + Math.floor(Math.random() * 20)}/${70 + Math.floor(Math.random() * 15)} mmHg` : 
          `${150 + Math.floor(Math.random() * 20)}/${95 + Math.floor(Math.random() * 15)} mmHg`,
        hemoglobin: isEligible ? 
          12.5 + Math.random() * 3 : // 12.5-15.5 g/dL for eligible
          10 + Math.random() * 2, // 10-12 g/dL for ineligible
        weight: 50 + Math.random() * 40, // 50-90 kg
        pulse: isEligible ? 
          60 + Math.floor(Math.random() * 20) : // 60-80 bpm for eligible
          90 + Math.floor(Math.random() * 30), // 90-120 bpm for ineligible
        temperature: 36.2 + Math.random() * 0.6, // 36.2-36.8°C
        generalCondition: isEligible ? 
          ['Good', 'Excellent', 'Stable'][Math.floor(Math.random() * 3)] :
          ['Fatigued', 'Weak', 'Stressed'][Math.floor(Math.random() * 3)],
        deferralReason: isEligible ? null : 
          ['Low hemoglobin', 'High blood pressure', 'Recent illness', 'Insufficient weight'][Math.floor(Math.random() * 4)],
        notes: isEligible ? 
          'Donor meets all health requirements for blood donation' :
          'Donor deferred due to health concerns. Advised to return after addressing issues.',
        status: HEALTH_CHECK_STATUS.COMPLETED
      };
      
      healthChecks.push(healthCheck);
    }
  }
  
  if (healthChecks.length > 0) {
    const createdHealthChecks = await HealthCheck.insertMany(healthChecks);
    console.log(`✅ Created ${createdHealthChecks.length} health check records`);
    console.log(`   ✅ Eligible: ${createdHealthChecks.filter(hc => hc.isEligible).length}`);
    console.log(`   ❌ Deferred: ${createdHealthChecks.filter(hc => !hc.isEligible).length}`);
    return createdHealthChecks;
  }
  
  return [];
}

async function createProcessDonationLogs(registrations, facilityStaff) {
  const processDonationLogs = [];
  const allStaff = facilityStaff;
  
  // Create logs for each status transition in registrations
  for (const registration of registrations) {
    const staff = allStaff.find(s => s.facilityId.toString() === registration.facilityId.toString());
    
    if (staff) {
      // Use createdAt instead of registrationDate
      const baseDate = registration.createdAt || new Date();
      
      // Create initial log for registration creation
      processDonationLogs.push({
        registrationId: registration._id,
        status: BLOOD_DONATION_REGISTRATION_STATUS.PENDING_APPROVAL,
        changedBy: staff._id,
        notes: 'Đăng ký hiến máu được tạo',
        changedAt: baseDate
      });
      
      // Create log for approval (if approved)
      if (registration.status !== BLOOD_DONATION_REGISTRATION_STATUS.PENDING_APPROVAL) {
        processDonationLogs.push({
          registrationId: registration._id,
          status: BLOOD_DONATION_REGISTRATION_STATUS.REGISTERED,
          changedBy: registration.approvedBy || staff._id,
          notes: 'Đăng ký được phê duyệt bởi nhân viên',
          changedAt: new Date(baseDate.getTime() + 30 * 60 * 1000) // 30 minutes later
        });
      }
      
      // Create logs for advanced statuses
      if ([BLOOD_DONATION_REGISTRATION_STATUS.CHECKED_IN, 
           BLOOD_DONATION_REGISTRATION_STATUS.IN_CONSULT,
           BLOOD_DONATION_REGISTRATION_STATUS.WAITING_DONATION,
           BLOOD_DONATION_REGISTRATION_STATUS.DONATING,
           BLOOD_DONATION_REGISTRATION_STATUS.DONATED,
           BLOOD_DONATION_REGISTRATION_STATUS.RESTING,
           BLOOD_DONATION_REGISTRATION_STATUS.POST_REST_CHECK,
           BLOOD_DONATION_REGISTRATION_STATUS.COMPLETED].includes(registration.status)) {
        
        // Check-in log
        processDonationLogs.push({
          registrationId: registration._id,
          status: BLOOD_DONATION_REGISTRATION_STATUS.CHECKED_IN,
          changedBy: staff._id,
          notes: 'Người hiến máu đã check-in tại cơ sở',
          changedAt: new Date(baseDate.getTime() + 60 * 60 * 1000) // 1 hour later
        });
        
        // In consultation log
        if (registration.status !== BLOOD_DONATION_REGISTRATION_STATUS.CHECKED_IN) {
          processDonationLogs.push({
            registrationId: registration._id,
            status: BLOOD_DONATION_REGISTRATION_STATUS.IN_CONSULT,
            changedBy: staff._id,
            notes: 'Bắt đầu tư vấn và kiểm tra sức khỏe',
            changedAt: new Date(baseDate.getTime() + 90 * 60 * 1000) // 1.5 hours later
          });
        }
        
        // Waiting donation log (if eligible)
        if ([BLOOD_DONATION_REGISTRATION_STATUS.WAITING_DONATION,
             BLOOD_DONATION_REGISTRATION_STATUS.DONATING,
             BLOOD_DONATION_REGISTRATION_STATUS.DONATED,
             BLOOD_DONATION_REGISTRATION_STATUS.RESTING,
             BLOOD_DONATION_REGISTRATION_STATUS.POST_REST_CHECK,
             BLOOD_DONATION_REGISTRATION_STATUS.COMPLETED].includes(registration.status)) {
          
          processDonationLogs.push({
            registrationId: registration._id,
            status: BLOOD_DONATION_REGISTRATION_STATUS.WAITING_DONATION,
            changedBy: staff._id,
            notes: 'Đủ điều kiện hiến máu, chờ đến lượt',
            changedAt: new Date(baseDate.getTime() + 120 * 60 * 1000) // 2 hours later
          });
          
          // Donating log
          if (registration.status !== BLOOD_DONATION_REGISTRATION_STATUS.WAITING_DONATION) {
            processDonationLogs.push({
              registrationId: registration._id,
              status: BLOOD_DONATION_REGISTRATION_STATUS.DONATING,
              changedBy: staff._id,
              notes: 'Bắt đầu quá trình hiến máu',
              changedAt: new Date(baseDate.getTime() + 150 * 60 * 1000) // 2.5 hours later
            });
          }
          
          // Donated log
          if ([BLOOD_DONATION_REGISTRATION_STATUS.DONATED,
               BLOOD_DONATION_REGISTRATION_STATUS.RESTING,
               BLOOD_DONATION_REGISTRATION_STATUS.POST_REST_CHECK,
               BLOOD_DONATION_REGISTRATION_STATUS.COMPLETED].includes(registration.status)) {
            
            processDonationLogs.push({
              registrationId: registration._id,
              status: BLOOD_DONATION_REGISTRATION_STATUS.DONATED,
              changedBy: staff._id,
              notes: 'Hoàn thành hiến máu thành công',
              changedAt: new Date(baseDate.getTime() + 180 * 60 * 1000) // 3 hours later
            });
          }
          
          // Resting log
          if ([BLOOD_DONATION_REGISTRATION_STATUS.RESTING,
               BLOOD_DONATION_REGISTRATION_STATUS.POST_REST_CHECK,
               BLOOD_DONATION_REGISTRATION_STATUS.COMPLETED].includes(registration.status)) {
            
            processDonationLogs.push({
              registrationId: registration._id,
              status: BLOOD_DONATION_REGISTRATION_STATUS.RESTING,
              changedBy: staff._id,
              notes: 'Người hiến máu đang nghỉ ngơi',
              changedAt: new Date(baseDate.getTime() + 190 * 60 * 1000) // 3.17 hours later
            });
          }
          
          // Post rest check log
          if ([BLOOD_DONATION_REGISTRATION_STATUS.POST_REST_CHECK,
               BLOOD_DONATION_REGISTRATION_STATUS.COMPLETED].includes(registration.status)) {
            
            processDonationLogs.push({
              registrationId: registration._id,
              status: BLOOD_DONATION_REGISTRATION_STATUS.POST_REST_CHECK,
              changedBy: staff._id,
              notes: 'Kiểm tra sức khỏe sau khi nghỉ ngơi',
              changedAt: new Date(baseDate.getTime() + 210 * 60 * 1000) // 3.5 hours later
            });
          }
          
          // Completed log
          if (registration.status === BLOOD_DONATION_REGISTRATION_STATUS.COMPLETED) {
            processDonationLogs.push({
              registrationId: registration._id,
              status: BLOOD_DONATION_REGISTRATION_STATUS.COMPLETED,
              changedBy: staff._id,
              notes: 'Hoàn thành toàn bộ quy trình hiến máu',
              changedAt: new Date(baseDate.getTime() + 240 * 60 * 1000) // 4 hours later
            });
          }
        }
      }
    }
  }
  
  if (processDonationLogs.length > 0) {
    // Create logs one by one to trigger pre-save middleware for unique code generation
    const createdLogs = [];
    console.log(`🔄 Creating ${processDonationLogs.length} process donation logs one by one...`);
    
    for (let i = 0; i < processDonationLogs.length; i++) {
      try {
        const log = await ProcessDonationLog.create(processDonationLogs[i]);
        createdLogs.push(log);
        if ((i + 1) % 10 === 0) {
          console.log(`  ✅ Created ${i + 1}/${processDonationLogs.length} logs`);
        }
      } catch (error) {
        console.error(`  ❌ Error creating log ${i + 1}:`, error.message);
        throw error;
      }
    }
    
    console.log(`✅ Created ${createdLogs.length} process donation log entries`);
    return createdLogs;
  }
  
  return [];
}

async function createBloodUnitsFromDonations(bloodDonations, bloodComponents, facilityStaff) {
  const bloodUnits = [];
  const doctors = facilityStaff.filter(staff => staff.position === STAFF_POSITION.DOCTOR);
  
  // Component expiry days mapping
  const componentExpiryDays = {
    [BLOOD_COMPONENT.WHOLE]: 35,
    [BLOOD_COMPONENT.RED_CELLS]: 42,
    [BLOOD_COMPONENT.PLASMA]: 365,
    [BLOOD_COMPONENT.PLATELETS]: 5
  };
  
  for (const donation of bloodDonations) {
    // Get facility from staffId
    const staff = facilityStaff.find(s => s._id.toString() === donation.staffId?.toString());
    const facilityId = staff?.facilityId;
    
    const doctor = doctors.find(d => d.facilityId.toString() === facilityId?.toString());
    
    if (doctor && facilityId && donation.status === BLOOD_DONATION_STATUS.COMPLETED) {
      // Create 2-3 blood units per donation (different components)
      const numUnits = 2 + Math.floor(Math.random() * 2); // 2-3 units
      const selectedComponents = [];
      
      // Always include whole blood
      selectedComponents.push(bloodComponents.find(c => c.name === BLOOD_COMPONENT.WHOLE));
      
      // Randomly add other components
      const otherComponents = bloodComponents.filter(c => c.name !== BLOOD_COMPONENT.WHOLE);
      for (let i = 0; i < numUnits - 1; i++) {
        const randomComponent = otherComponents[Math.floor(Math.random() * otherComponents.length)];
        if (!selectedComponents.find(c => c._id.toString() === randomComponent._id.toString())) {
          selectedComponents.push(randomComponent);
        }
      }
      
      for (const component of selectedComponents) {
        const expiryDays = componentExpiryDays[component.name] || 35;
        const collectedAt = donation.donationDate;
        const expiresAt = new Date(collectedAt.getTime() + expiryDays * 24 * 60 * 60 * 1000);
        
        // Determine quantity based on component type
        let quantity;
        switch (component.name) {
          case BLOOD_COMPONENT.WHOLE:
            quantity = 450; // Standard whole blood unit
            break;
          case BLOOD_COMPONENT.RED_CELLS:
            quantity = 250; // Red cells from whole blood
            break;
          case BLOOD_COMPONENT.PLASMA:
            quantity = 200; // Plasma from whole blood
            break;
          case BLOOD_COMPONENT.PLATELETS:
            quantity = 50; // Platelet concentrate
            break;
          default:
            quantity = 450;
        }
        
        // Determine test results (95% pass all tests)
        const passAllTests = Math.random() > 0.05;
        const testResults = {
          hiv: passAllTests ? TEST_BLOOD_UNIT_RESULT.NEGATIVE : 
               (Math.random() > 0.5 ? TEST_BLOOD_UNIT_RESULT.NEGATIVE : TEST_BLOOD_UNIT_RESULT.POSITIVE),
          hepatitisB: passAllTests ? TEST_BLOOD_UNIT_RESULT.NEGATIVE : 
                     (Math.random() > 0.5 ? TEST_BLOOD_UNIT_RESULT.NEGATIVE : TEST_BLOOD_UNIT_RESULT.POSITIVE),
          hepatitisC: passAllTests ? TEST_BLOOD_UNIT_RESULT.NEGATIVE : 
                     (Math.random() > 0.5 ? TEST_BLOOD_UNIT_RESULT.NEGATIVE : TEST_BLOOD_UNIT_RESULT.POSITIVE),
          syphilis: passAllTests ? TEST_BLOOD_UNIT_RESULT.NEGATIVE : 
                   (Math.random() > 0.5 ? TEST_BLOOD_UNIT_RESULT.NEGATIVE : TEST_BLOOD_UNIT_RESULT.POSITIVE),
          notes: passAllTests ? 'Tất cả test âm tính, đơn vị máu an toàn' : 'Phát hiện bất thường trong test, đơn vị máu bị từ chối'
        };
        
        // Determine status based on test results
        const allTestsNegative = Object.values(testResults).slice(0, 4).every(result => result === TEST_BLOOD_UNIT_RESULT.NEGATIVE);
        const status = allTestsNegative ? BLOOD_UNIT_STATUS.AVAILABLE : BLOOD_UNIT_STATUS.REJECTED;
        
        const bloodUnit = {
          donationId: donation._id,
          facilityId: facilityId, // Use facilityId from staff
          bloodGroupId: donation.bloodGroupId,
          componentId: component._id,
          quantity,
          remainingQuantity: quantity,
          deliveredQuantity: 0,
          collectedAt,
          expiresAt,
          status,
          testResults,
          processedBy: doctor._id,
          processedAt: new Date(collectedAt.getTime() + (1 + Math.random() * 2) * 24 * 60 * 60 * 1000), // 1-3 days after collection
          approvedBy: allTestsNegative ? doctor._id : null,
          approvedAt: allTestsNegative ? new Date(collectedAt.getTime() + (2 + Math.random() * 2) * 24 * 60 * 60 * 1000) : null // 2-4 days after collection
        };
        
        bloodUnits.push(bloodUnit);
      }
    }
  }
  
  if (bloodUnits.length > 0) {
    // Create blood units one by one to trigger pre-save middleware for unique code generation
    const createdBloodUnits = [];
    console.log(`🔄 Creating ${bloodUnits.length} blood units one by one...`);
    
    for (let i = 0; i < bloodUnits.length; i++) {
      try {
        const bloodUnit = await BloodUnit.create(bloodUnits[i]);
        createdBloodUnits.push(bloodUnit);
        if ((i + 1) % 5 === 0) {
          console.log(`  ✅ Created ${i + 1}/${bloodUnits.length} blood units`);
        }
      } catch (error) {
        console.error(`  ❌ Error creating blood unit ${i + 1}:`, error.message);
        throw error;
      }
    }
    
    console.log(`✅ Created ${createdBloodUnits.length} blood units from ${bloodDonations.length} donations`);
    console.log(`   ✅ Available: ${createdBloodUnits.filter(bu => bu.status === BLOOD_UNIT_STATUS.AVAILABLE).length}`);
    console.log(`   ❌ Rejected: ${createdBloodUnits.filter(bu => bu.status === BLOOD_UNIT_STATUS.REJECTED).length}`);
    console.log(`   🧪 Testing: ${createdBloodUnits.filter(bu => bu.status === BLOOD_UNIT_STATUS.TESTING).length}`);
    return createdBloodUnits;
  }
  
  return [];
}

async function createBloodInventoryFromUnits(bloodUnits, facilities, bloodGroups, bloodComponents) {
  const inventoryMap = new Map();
  
  // Group blood units by facility, blood group, and component
  for (const unit of bloodUnits) {
    if (unit.status === BLOOD_UNIT_STATUS.AVAILABLE) {
      const key = `${unit.facilityId}_${unit.bloodGroupId}_${unit.componentId}`;
      
      if (!inventoryMap.has(key)) {
        inventoryMap.set(key, {
          facilityId: unit.facilityId,
          groupId: unit.bloodGroupId, // Changed from bloodGroupId to groupId
          componentId: unit.componentId,
          totalQuantity: 0
        });
      }
      
      const inventory = inventoryMap.get(key);
      inventory.totalQuantity += unit.remainingQuantity;
    }
  }
  
  // Create inventory records one by one to trigger pre-save middleware
  const createdInventory = [];
  console.log(`🔄 Creating ${inventoryMap.size} blood inventory records one by one...`);
  
  let index = 0;
  for (const [key, data] of inventoryMap) {
    const bloodGroup = bloodGroups.find(bg => bg._id.toString() === data.groupId.toString());
    const component = bloodComponents.find(bc => bc._id.toString() === data.componentId.toString());
    
    try {
      const inventoryRecord = await BloodInventory.create({
        facilityId: data.facilityId,
        groupId: data.groupId, // Use groupId as per model schema
        componentId: data.componentId,
        totalQuantity: data.totalQuantity
      });
      
      createdInventory.push(inventoryRecord);
      index++;
      console.log(`  ✅ Created inventory ${index}/${inventoryMap.size}: ${inventoryRecord.code} - ${bloodGroup?.name} ${component?.name}`);
    } catch (error) {
      console.error(`  ❌ Error creating inventory record ${index + 1}:`, error.message);
      throw error;
    }
  }
  
  console.log(`✅ Created ${createdInventory.length} blood inventory records`);
  
  // Log inventory summary by facility
  for (const facility of facilities) {
    const facilityInventory = createdInventory.filter(inv => inv.facilityId.toString() === facility._id.toString());
    const totalQuantity = facilityInventory.reduce((sum, inv) => sum + inv.totalQuantity, 0);
    console.log(`   📦 ${facility.name}: ${facilityInventory.length} inventory types, ${totalQuantity}ml total`);
  }
  
  return createdInventory;
}

async function createBloodRequests(users, facilities, bloodGroups, bloodComponents, facilityStaff) {
  const bloodRequests = [];
  
  // Get donor users (MEMBER role)
  const donors = users.filter(user => user.role === USER_ROLE.MEMBER);
  const managers = facilityStaff.filter(staff => staff.position === STAFF_POSITION.MANAGER);
  
  console.log(`🩸 Creating blood requests for ${facilities.length} facilities...`);
  
  // Tạo 14 blood requests (7 cho mỗi facility, mỗi status có 2 requests)
  const statuses = Object.values(BLOOD_REQUEST_STATUS);
  
  let requestIndex = 0;
  
  for (const facility of facilities) {
    const facilityManager = managers.find(m => m.facilityId.toString() === facility._id.toString());
    
    console.log(`🏥 Creating requests for ${facility.name}...`);
    
    // Tạo 2 requests cho mỗi status (7 statuses = 14 requests per facility)
    for (let statusIndex = 0; statusIndex < statuses.length; statusIndex++) {
      const status = statuses[statusIndex];
      
      // Tạo 2 requests cho status này
      for (let i = 0; i < 2; i++) {
        const donor = donors[requestIndex % donors.length];
        const bloodGroup = bloodGroups[requestIndex % bloodGroups.length];
        const component = bloodComponents[requestIndex % bloodComponents.length];
        
        // Tạo ngày yêu cầu trong khoảng 1-30 ngày tới
        const preferredDate = new Date();
        preferredDate.setDate(preferredDate.getDate() + Math.floor(Math.random() * 30) + 1);
        
        // Tạo địa chỉ và tọa độ giả
        const addresses = [
          { address: '123 Nguyễn Văn Cừ, Quận 5, TP.HCM', coordinates: [106.6583, 10.7554] },
          { address: '456 Lê Đại Hành, Quận 11, TP.HCM', coordinates: [106.6544, 10.7614] },
          { address: '789 Võ Văn Tần, Quận 3, TP.HCM', coordinates: [106.6917, 10.7769] },
          { address: '321 Pasteur, Quận 1, TP.HCM', coordinates: [106.6958, 10.7769] },
          { address: '654 Điện Biên Phủ, Quận 10, TP.HCM', coordinates: [106.6667, 10.7667] }
        ];
        const addressInfo = addresses[requestIndex % addresses.length];
        
        const bloodRequest = {
          groupId: bloodGroup._id,
          userId: donor._id,
          facilityId: facility._id,
          componentId: component._id,
          quantity: 350 + Math.floor(Math.random() * 100), // 350-450ml
          isUrgent: Math.random() > 0.7, // 30% urgent
          status: status,
          patientName: donor.fullName,
          patientPhone: donor.phone,
          address: addressInfo.address,
          location: {
            type: 'Point',
            coordinates: addressInfo.coordinates
          },
          medicalDocumentUrl: [
            'https://res.cloudinary.com/bloodhouse/image/upload/v1/medical-docs/sample1.pdf',
            'https://res.cloudinary.com/bloodhouse/image/upload/v1/medical-docs/sample2.pdf'
          ],
          reason: [
            'Phẫu thuật tim mạch khẩn cấp',
            'Điều trị ung thư máu',
            'Tai nạn giao thông nghiêm trọng',
            'Phẫu thuật ghép tạng',
            'Điều trị bệnh tan máu',
            'Phẫu thuật sản khoa',
            'Điều trị xuất huyết tiêu hóa'
          ][requestIndex % 7],
          note: `Ghi chú cho yêu cầu máu ${requestIndex + 1} - ${status}`,
          preferredDate: preferredDate,
          needsSupport: status === BLOOD_REQUEST_STATUS.APPROVED && Math.random() > 0.5,
          isFulfilled: [BLOOD_REQUEST_STATUS.COMPLETED, BLOOD_REQUEST_STATUS.ASSIGNED].includes(status)
        };
        
        // Thêm thông tin phê duyệt nếu status không phải pending
        if (status !== BLOOD_REQUEST_STATUS.PENDING_APPROVAL && facilityManager) {
          bloodRequest.approvedBy = facilityManager._id;
          bloodRequest.approvedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // 0-7 ngày trước
        }
        
        // Thêm thông tin phân phối nếu status là assigned hoặc completed
        if ([BLOOD_REQUEST_STATUS.ASSIGNED, BLOOD_REQUEST_STATUS.COMPLETED].includes(status) && facilityManager) {
          bloodRequest.distributedBy = facilityManager._id;
          bloodRequest.distributedAt = new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000); // 0-3 ngày trước
          bloodRequest.scheduledDeliveryDate = new Date(Date.now() + Math.random() * 2 * 24 * 60 * 60 * 1000); // 0-2 ngày tới
        }
        
        bloodRequests.push(bloodRequest);
        requestIndex++;
      }
    }
  }
  
  // Tạo blood requests một cách tuần tự để tránh lỗi
  const createdBloodRequests = [];
  console.log(`🔄 Creating ${bloodRequests.length} blood requests one by one...`);
  
  for (let i = 0; i < bloodRequests.length; i++) {
    try {
      const bloodRequest = await BloodRequest.create(bloodRequests[i]);
      createdBloodRequests.push(bloodRequest);
      console.log(`  ✅ Created blood request ${i + 1}/${bloodRequests.length}: ${bloodRequest._id} - ${bloodRequest.status}`);
    } catch (error) {
      console.error(`  ❌ Error creating blood request ${i + 1}:`, error.message);
      throw error;
    }
  }
  
  console.log(`✅ Created ${createdBloodRequests.length} blood requests`);
  console.log(`   📊 Status distribution:`);
  
  // Log distribution by status
  const statusCounts = {};
  createdBloodRequests.forEach(req => {
    statusCounts[req.status] = (statusCounts[req.status] || 0) + 1;
  });
  
  Object.keys(statusCounts).forEach(status => {
    console.log(`     - ${status}: ${statusCounts[status]} requests`);
  });
  
  return createdBloodRequests;
}

async function createBloodRequestSupports(bloodRequests, users) {
  const bloodRequestSupports = [];
  
  // Lấy các blood requests cần support (approved và needsSupport = true)
  const requestsNeedingSupport = bloodRequests.filter(req => 
    req.status === BLOOD_REQUEST_STATUS.APPROVED && req.needsSupport
  );
  
  if (requestsNeedingSupport.length === 0) {
    console.log('📝 No blood requests need support, skipping support creation');
    return [];
  }
  
  // Lấy donors có thể support
  const donors = users.filter(user => user.role === USER_ROLE.MEMBER);
  
  console.log(`🤝 Creating blood request supports for ${requestsNeedingSupport.length} requests...`);
  
  for (const request of requestsNeedingSupport) {
    // Tạo 2-5 support requests cho mỗi blood request
    const numSupports = 2 + Math.floor(Math.random() * 4); // 2-5 supports
    
    for (let i = 0; i < numSupports; i++) {
      const supporter = donors[Math.floor(Math.random() * donors.length)];
      
      // Kiểm tra xem supporter đã support request này chưa
      const existingSupport = bloodRequestSupports.find(support => 
        support.requestId.toString() === request._id.toString() && 
        support.userId.toString() === supporter._id.toString()
      );
      
      if (!existingSupport) {
        const supportStatus = ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)];
        
        const support = {
          requestId: request._id,
          userId: supporter._id,
          phone: supporter.phone,
          email: supporter.email,
          note: `Tôi sẵn sàng hỗ trợ hiến máu cho yêu cầu này. Liên hệ tôi qua số ${supporter.phone}`,
          status: supportStatus
        };
        
        bloodRequestSupports.push(support);
      }
    }
  }
  
  // Tạo blood request supports
  const createdSupports = [];
  console.log(`🔄 Creating ${bloodRequestSupports.length} blood request supports...`);
  
  for (let i = 0; i < bloodRequestSupports.length; i++) {
    try {
      const support = await BloodRequestSupport.create(bloodRequestSupports[i]);
      createdSupports.push(support);
      if ((i + 1) % 5 === 0) {
        console.log(`  ✅ Created ${i + 1}/${bloodRequestSupports.length} supports`);
      }
    } catch (error) {
      console.error(`  ❌ Error creating support ${i + 1}:`, error.message);
      throw error;
    }
  }
  
  console.log(`✅ Created ${createdSupports.length} blood request supports`);
  
  // Log distribution by status
  const statusCounts = {};
  createdSupports.forEach(support => {
    statusCounts[support.status] = (statusCounts[support.status] || 0) + 1;
  });
  
  console.log(`   📊 Support status distribution:`);
  Object.keys(statusCounts).forEach(status => {
    console.log(`     - ${status}: ${statusCounts[status]} supports`);
  });
  
  return createdSupports;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    await clearDatabase();
    
    // Create data in correct order (respecting foreign key dependencies)
    const bloodGroups = await createBloodGroups();
    const bloodComponents = await createBloodComponents();
    const facilities = await createFacilities();
    const users = await createUsers(bloodGroups);
    const facilityStaff = await createFacilityStaff(users, facilities);
    const registrations = await createBloodDonationRegistrations(users, facilities, bloodGroups, facilityStaff);
    
    // Create gift management data
    console.log('\n🎁 Creating gift management data...');
    const giftItems = await createGiftItems();
    const giftPackages = await createGiftPackages(giftItems, facilityStaff, facilities);
    const giftBudgets = await createGiftBudgets(facilities);
    const giftInventories = await createGiftInventories(giftItems, facilities);
    const giftLogs = await createGiftLogs(giftItems, giftPackages, facilities, facilityStaff);
    
    // Create content management data
    console.log('\n📝 Creating content management data...');
    const contentCategories = await createContentCategories();
    const contentData = await createContentData(users, facilities, facilityStaff, contentCategories);
    
    const bloodDonations = await createCompletedBloodDonations(users, facilities, bloodGroups, facilityStaff);
    const giftDistributions = await createSampleGiftDistributions(giftPackages, giftItems, users, facilityStaff, facilities, bloodDonations);
    
    // Create health checks
    const healthChecks = await createHealthChecks(registrations, facilityStaff);
    
    // Create process donation logs
    const processDonationLogs = await createProcessDonationLogs(registrations, facilityStaff);
    
    // Create blood units from donations
    const bloodUnits = await createBloodUnitsFromDonations(bloodDonations, bloodComponents, facilityStaff);
    
    // Create blood inventory from units
    const bloodInventory = await createBloodInventoryFromUnits(bloodUnits, facilities, bloodGroups, bloodComponents);
    
    // Create blood requests
    const bloodRequests = await createBloodRequests(users, facilities, bloodGroups, bloodComponents, facilityStaff);
    
    // Create blood request supports
    const bloodRequestSupports = await createBloodRequestSupports(bloodRequests, users);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Blood Groups: ${bloodGroups.length}`);
    console.log(`- Blood Components: ${bloodComponents.length}`);
    console.log(`- Facilities: ${facilities.length} (Chợ Rẫy & Viện Huyết học TP.HCM)`);
    console.log(`- Users: ${users.length}`);
    console.log(`  - Admins: ${users.filter(u => u.role === USER_ROLE.ADMIN).length}`);
    console.log(`  - Managers: ${users.filter(u => u.role === USER_ROLE.MANAGER).length}`);
    console.log(`  - Doctors: ${users.filter(u => u.role === USER_ROLE.DOCTOR).length}`);
    console.log(`  - Nurses: ${users.filter(u => u.role === USER_ROLE.NURSE).length}`);
    console.log(`  - Donors: ${users.filter(u => u.role === USER_ROLE.MEMBER).length}`);
    console.log(`- Facility Staff: ${facilityStaff.length}`);
    console.log(`- Blood Donation Registrations: ${registrations.length} (Focused on Chợ Rẫy)`);
    console.log(`- Completed Blood Donations: ${bloodDonations.length} (For gift distribution testing)`);
    
    // Blood donation workflow data
    console.log('\n🩸 Blood Donation Workflow Data:');
    console.log(`- Health Checks: ${healthChecks.length} (90% eligible, 10% deferred)`);
    console.log(`- Process Donation Logs: ${processDonationLogs.length} (Complete audit trail)`);
    console.log(`- Blood Units: ${bloodUnits.length} (From completed donations)`);
    console.log(`  - Available: ${bloodUnits.filter(bu => bu.status === BLOOD_UNIT_STATUS.AVAILABLE).length}`);
    console.log(`  - Rejected: ${bloodUnits.filter(bu => bu.status === BLOOD_UNIT_STATUS.REJECTED).length}`);
    console.log(`  - Testing: ${bloodUnits.filter(bu => bu.status === BLOOD_UNIT_STATUS.TESTING).length}`);
    console.log(`- Blood Inventory Records: ${bloodInventory.length} (Grouped by facility/blood group/component)`);
    
    // Blood request summary
    console.log('\n🩸 Blood Request System Data:');
    console.log(`- Blood Requests: ${bloodRequests.length} (${bloodRequests.length/2} per facility, 2 per status)`);
    console.log(`- Blood Request Supports: ${bloodRequestSupports.length} (For approved requests needing support)`);
    
    // Blood request status distribution
    const requestStatusCounts = {};
    bloodRequests.forEach(req => {
      requestStatusCounts[req.status] = (requestStatusCounts[req.status] || 0) + 1;
    });
    console.log(`   📊 Request status distribution:`);
    Object.keys(requestStatusCounts).forEach(status => {
      console.log(`     - ${status}: ${requestStatusCounts[status]} requests`);
    });
    
    // Support status distribution
    if (bloodRequestSupports.length > 0) {
      const supportStatusCounts = {};
      bloodRequestSupports.forEach(support => {
        supportStatusCounts[support.status] = (supportStatusCounts[support.status] || 0) + 1;
      });
      console.log(`   🤝 Support status distribution:`);
      Object.keys(supportStatusCounts).forEach(status => {
        console.log(`     - ${status}: ${supportStatusCounts[status]} supports`);
      });
    }
    
    // Gift management summary
    console.log('\n🎁 Gift Management Data:');
    console.log(`- Gift Items: ${giftItems.length} (5 categories: Health, Food, Beverage, Merchandise, Other)`);
    console.log(`- Gift Packages: ${giftPackages.length} (Curated packages with quantities for different donor types)`);
    console.log(`- Gift Budgets: ${giftBudgets.length} (Annual budgets for both facilities)`);
    console.log(`- Gift Inventories: ${giftInventories.length} (Stock for all items at both facilities)`);
    console.log(`- Gift Distributions: ${giftDistributions.length} (Sample distributions to test the system)`);
    console.log(`- Gift Logs: ${giftLogs.length} (Activity logs for audit trail)`);
    
    // Content management summary
    console.log('\n📝 Content Management Data:');
    console.log(`- Content Categories: ${contentCategories.length} (Tin tức, Hướng dẫn, Sức khỏe, Câu chuyện, Sự kiện)`);
    console.log(`- Content Articles: ${contentData.length} (2 system-wide by Admin + 2 per facility by Managers)`);
    console.log(`  - System-wide contents: ${contentData.filter(c => c.facilityId === null).length} (by Admin)`);
    console.log(`  - Facility-specific contents: ${contentData.filter(c => c.facilityId !== null).length} (by Facility Managers)`);
    
    // Log content by facility
    for (const facility of facilities) {
      const facilityContents = contentData.filter(c => c.facilityId && c.facilityId.toString() === facility._id.toString());
      console.log(`    - ${facility.name}: ${facilityContents.length} contents`);
    }
    
    await verifyData();
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding script
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };