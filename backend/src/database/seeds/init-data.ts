import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../modules/users/entities/user.entity';
import { Role, RoleType } from '../../modules/roles/entities/role.entity';
import { Enterprise } from '../../modules/enterprises/entities/enterprise.entity';

export async function seedData(dataSource: DataSource) {
  console.log('开始初始化数据库数据...');

  // 创建角色
  const roleRepository = dataSource.getRepository(Role);
  const roles = await roleRepository.save([
    roleRepository.create({
      name: '管理员',
      type: RoleType.ADMIN,
      description: '系统管理员，拥有所有权限',
    }),
    roleRepository.create({
      name: '生产者',
      type: RoleType.PRODUCER,
      description: '蔬菜生产者，管理自己的企业和产品',
    }),
    roleRepository.create({
      name: '消费者',
      type: RoleType.CONSUMER,
      description: '普通消费者，查看产品信息',
    }),
  ]);
  console.log('角色数据初始化完成');

  // 创建企业
  const enterpriseRepository = dataSource.getRepository(Enterprise);
  const enterprises = await enterpriseRepository.save([
    enterpriseRepository.create({
      name: '绿色蔬菜农场',
      contacts: '张经理',
      tel: '13800138001',
      license: 'GSF001',
      address: '北京市大兴区蔬菜基地',
    }),
    enterpriseRepository.create({
      name: '生态农业合作社',
      contacts: '李主任',
      tel: '13800138002',
      license: 'EAC002',
      address: '河北省廊坊市农业园区',
    }),
  ]);
  console.log('企业数据初始化完成');

  // 创建用户
  const userRepository = dataSource.getRepository(User);
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  await userRepository.save([
    userRepository.create({
      username: 'admin',
      password: hashedPassword,
      tel: '13800138000',
      roleId: roles[0].id, // 管理员
      enterpriseId: null,
    }),
    userRepository.create({
      username: 'producer1',
      password: hashedPassword,
      tel: '13800138001',
      roleId: roles[1].id, // 生产者
      enterpriseId: enterprises[0].id,
    }),
    userRepository.create({
      username: 'producer2',
      password: hashedPassword,
      tel: '13800138002',
      roleId: roles[1].id, // 生产者
      enterpriseId: enterprises[1].id,
    }),
    userRepository.create({
      username: 'consumer1',
      password: hashedPassword,
      tel: '13800138003',
      roleId: roles[2].id, // 消费者
      enterpriseId: null,
    }),
  ]);
  console.log('用户数据初始化完成');

  console.log('数据库数据初始化完成！');
  console.log('测试账号：');
  console.log('- 管理员: admin / 123456');
  console.log('- 生产者1: producer1 / 123456');
  console.log('- 生产者2: producer2 / 123456');
  console.log('- 消费者: consumer1 / 123456');
} 