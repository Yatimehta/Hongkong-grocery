const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Helper to record audit log
async function logAction(action, target, details) {
  try {
    await prisma.activityLog.create({
      data: { action, user: 'Super Admin', target, details: String(details) }
    });
  } catch (e) { console.error('Log failure:', e); }
}

// GET all admin users / staff members
router.get('/', async (req, res) => {
  try {
    const staff = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true }
    });
    
    // Seed initial admin staff if empty
    if (staff.length === 0) {
      const initialAdmin = await prisma.adminUser.create({
        data: {
          name: 'Shop Owner (Super Admin)',
          email: 'admin@freshmarketgrocery.com',
          passwordHash: '$2b$10$YourHashedPasswordHereFallback',
          role: 'super_admin',
          permissions: JSON.stringify(['all'])
        }
      });
      return res.json([initialAdmin]);
    }
    
    res.json(staff);
  } catch (err) {
    console.error('Error fetching staff members:', err);
    res.status(500).json({ error: 'Failed to fetch staff accounts' });
  }
});

// POST create new staff account
router.post('/', async (req, res) => {
  try {
    const { name, email, role, permissions, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required' });
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'An admin account with this email already exists' });
    }

    const newStaff = await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash: password ? `$2b$10$hashed_${password}` : '$2b$10$defaultPasswordHash',
        role: role || 'catalog_manager',
        permissions: typeof permissions === 'object' ? JSON.stringify(permissions) : (permissions || '["products", "orders"]')
      },
      select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true }
    });

    await logAction('Create Staff Account', `Staff (${name})`, `Assigned role: ${newStaff.role}`);
    res.status(201).json(newStaff);
  } catch (err) {
    console.error('Error creating staff account:', err);
    res.status(500).json({ error: 'Failed to create staff account' });
  }
});

// PUT update staff account & permissions
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, permissions } = req.body;

    const updated = await prisma.adminUser.update({
      where: { id },
      data: {
        name,
        email,
        role,
        permissions: typeof permissions === 'object' ? JSON.stringify(permissions) : permissions
      },
      select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true }
    });

    await logAction('Update Staff Role & Permissions', `Staff (${updated.name})`, `Updated role to ${role}`);
    res.json(updated);
  } catch (err) {
    console.error('Error updating staff account:', err);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

// DELETE staff account
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await prisma.adminUser.findUnique({ where: { id } });
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    if (staff.role === 'super_admin') {
      return res.status(400).json({ error: 'Cannot delete the primary Super Admin account' });
    }

    await prisma.adminUser.delete({ where: { id } });
    await logAction('Revoke Staff Access', `Staff (${staff.name})`, `Removed admin account and revoked permissions`);
    res.json({ success: true, message: 'Staff member removed successfully' });
  } catch (err) {
    console.error('Error deleting staff member:', err);
    res.status(500).json({ error: 'Failed to remove staff account' });
  }
});

module.exports = router;
