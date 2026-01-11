const prisma = require("../config/prisma");
const { Prisma } = require("@prisma/client");


// ---------------- Category Controller ----------------

// สร้าง Category (Main Category)
exports.createCategory = async (req, res) => {
   try {
   const { name } = req.body;
  
  // *** เริ่มต้นการแก้ไข: ป้องกันข้อมูลซ้ำ และ Validation ***
   // 1. ตรวจสอบว่ามี name ส่งมาหรือไม่
   if (!name) {
   return res.status(400).json({ message: "Name is required" });
   }
  
   // 2. ตรวจสอบว่ามี Category ชื่อนี้อยู่แล้วหรือไม่ (ป้องกันซ้ำ)
   const existingCategory = await prisma.category.findFirst({ // <--- ✅ แก้ไขเป็น findFirst
     where: { name: name }, 
     });
  
   if (existingCategory) {
   return res.status(400).json({ message: "Category with this name already exists" });
   }
  // *** สิ้นสุดการแก้ไข: ป้องกันข้อมูลซ้ำ และ Validation ***
  
   const category = await prisma.category.create({
   data: { name },
   });
  
   res.status(201).send(category); // <--- ปรับ Status Code เป็น 201 (Created)
   } catch (err) {
   console.log(err);
   res.status(500).json({ message: "create category controller Error" });
   }
  };

// ดึง Categories พร้อม SubCategories
exports.listCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { subCategories: true },
    });
    res.send(categories);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "list category controller Error" });
  }
};

// ลบ Category
exports.removeCategory = async (req, res) => {
    try {
      const { id } = req.params;
  
  // *** เริ่มต้นการแก้ไข: ปรับปรุง Logic การลบและ Error Handling ***
      const categoryId = Number(id);
  
      // 1. ตรวจสอบว่า ID เป็นตัวเลขที่ถูกต้อง
      if (isNaN(categoryId)) {
          return res.status(400).json({ message: "Invalid Category ID" });
      }
  
      // 2. ตรวจสอบว่ามี subcategory อยู่หรือไม่ (Logic เดิมของคุณ ถูกต้องแล้ว)
      const subCategories = await prisma.subCategory.findMany({
        where: { categoryId: categoryId },
      });
  
      if (subCategories.length > 0) {
        return res
          .status(400)
          .json({ message: "Cannot delete category with subcategories" });
      }
  
      // 3. ทำการลบ
      const category = await prisma.category.delete({
        where: { id: categoryId },
      });
  // *** สิ้นสุดการแก้ไข: ปรับปรุง Logic การลบและ Error Handling ***
  
      res.send(category);
    } catch (err) {
  // *** เริ่มต้นการแก้ไข: จัดการ Error กรณีหา ID ไม่เจอ ***
      // 4. ดักจับ Error กรณีลบไม่สำเร็จ (เช่น หา ID ที่จะลบไม่เจอ)
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return res.status(404).json({ message: "Category not found" });
      }
  // *** สิ้นสุดการแก้ไข: จัดการ Error กรณีหา ID ไม่เจอ ***
      console.log(err);
      res.status(500).json({ message: "remove category controller Error" });
    }
  };
  // แก้ไข Category
  exports.updateCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
  
      const categoryId = Number(id);
  
      // 1. ตรวจสอบว่า ID และ Name ถูกต้องหรือไม่
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid Category ID" });
      }
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
  
      // 2. ตรวจสอบว่ามีชื่อซ้ำหรือไม่ (โดยไม่นับตัวมันเอง)
      // หา category อื่นที่มีชื่อนี้ แต่ ID ไม่ใช่ ID ที่เรากำลังแก้ไข
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: name,
          NOT: { id: categoryId } 
        }
      });
  
      if (existingCategory) {
        return res.status(400).json({ message: "Category with this name already exists" });
      }
  
      // 3. ทำการอัปเดตข้อมูล
      const category = await prisma.category.update({
        where: { id: categoryId },
        data: { name: name }
      });
  
      res.send(category);
  
    } catch (err) {
      // 4. ดักจับ Error กรณีหา ID ไม่เจอ (P2025)
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return res.status(404).json({ message: "Category not found" });
      }
      console.log(err);
      res.status(500).json({ message: "update category controller Error" });
    }
  };

// ---------------- SubCategory Controller ----------------

// สร้าง SubCategory
exports.createSubCategory = async (req, res) => {
    try {
      const { name, categoryId } = req.body; // categoryId = parent category
  
  // *** เริ่มต้นการแก้ไข: ป้องกันข้อมูลซ้ำ และ Validation ***
      // 1. ตรวจสอบ Input
      if (!name || !categoryId) {
        return res.status(400).json({ message: "Name and categoryId are required" });
      }
  
      const parentId = Number(categoryId);
      if (isNaN(parentId)) {
          return res.status(400).json({ message: "Invalid Category ID" });
      }
  
      // 2. ตรวจสอบว่า Category (แม่) ที่จะเอาไปเชื่อม มีอยู่จริงหรือไม่
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });
  
      if (!parentCategory) {
        return res.status(404).json({ message: "Parent Category not found" });
      }
  
      // 3. ตรวจสอบข้อมูลซ้ำ (ป้องกันการสร้าง SubCategory ชื่อซ้ำ ภายใต้ Category แม่ เดียวกัน)
      const existingSubCategory = await prisma.subCategory.findFirst({
        where: {
          name: name,
          categoryId: parentId,
        },
      });
  
      if (existingSubCategory) {
        return res.status(400).json({ message: "This subcategory already exists in this category" });
      }
  // *** สิ้นสุดการแก้ไข: ป้องกันข้อมูลซ้ำ และ Validation ***
  
      const subCategory = await prisma.subCategory.create({
        data: {
          name,
          category: { connect: { id: parentId } }, // <--- ใช้ parentId ที่เราตรวจสอบแล้ว
        },
      });
  
      res.status(201).send(subCategory); // <--- ปรับ Status Code เป็น 201 (Created)
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "create subcategory controller Error" });
    }
  };

// ดึง SubCategories พร้อม Category
exports.listSubCategories = async (req, res) => {
  try {
    const subCategories = await prisma.subCategory.findMany({
      include: { category: true }, // include parent category
    });

    res.send(subCategories);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "list subcategory controller Error" });
  }
};

// ลบ SubCategory
exports.removeSubCategory = async (req, res) => {
   try {
    const { id } = req.params;
  
  // *** เริ่มต้นการแก้ไข: ปรับปรุง Logic การลบและ Error Handling ***
      const subId = Number(id);
  
      // 1. ตรวจสอบว่า ID เป็นตัวเลขที่ถูกต้อง
      if (isNaN(subId)) {
          return res.status(400).json({ message: "Invalid SubCategory ID" });
      }
  
    const subCategory = await prisma.subCategory.delete({
     where: { id: subId },
    });
  // *** สิ้นสุดการแก้ไข: ปรับปรุง Logic การลบและ Error Handling ***
  
    res.send(subCategory);
   } catch (err) {
  // *** เริ่มต้นการแก้ไข: จัดการ Error กรณีหา ID ไม่เจอ ***
    // 2. ดักจับ Error กรณีลบไม่สำเร็จ (เช่น หา ID ที่จะลบไม่เจอ)
   if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
   return res.status(404).json({ message: "SubCategory not found" });
   }
  // *** สิ้นสุดการแก้ไข: จัดการ Error กรณีหา ID ไม่เจอ ***
   console.log(err);
   res.status(500).json({ message: "remove subcategory controller Error" });
   }
  };

// แก้ไข SubCategory
exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId } = req.body; // รับ categoryId เผื่อต้องการย้ายหมวดแม่ด้วย

    const subId = Number(id);

    // 1. ตรวจสอบ ID
    if (isNaN(subId)) {
      return res.status(400).json({ message: "Invalid SubCategory ID" });
    }
    
    // 2. ตรวจสอบว่าส่งชื่อมาแก้ไขหรือไม่
    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }

    // 3. เตรียมข้อมูลที่จะอัปเดต
    const updateData = { name };

    // ถ้ามีการส่ง categoryId มาเพื่อย้ายหมวดแม่ ให้ตรวจสอบและเพิ่มเข้าไปใน updateData
    if (categoryId) {
        const parentId = Number(categoryId);
        if (isNaN(parentId)) {
            return res.status(400).json({ message: "Invalid Parent Category ID" });
        }
        
        // เช็คว่าแม่ตัวใหม่มีอยู่จริงไหม
        const parentExists = await prisma.category.findUnique({
            where: { id: parentId }
        });
        if (!parentExists) {
            return res.status(404).json({ message: "Parent Category not found" });
        }

        updateData.categoryId = parentId;
    }

    // 4. (Optional) เช็คชื่อซ้ำในหมวดเดียวกัน (logic นี้ซับซ้อนหน่อย ถ้าไม่ซีเรียสเรื่องชื่อซ้ำใน sub ข้ามไปได้)
    // ตรงนี้ผมละไว้ก่อนเพื่อให้โค้ดไม่ยาวเกินไป แต่ถ้าต้องการบอกได้ครับ

    // 5. ทำการอัปเดต
    const subCategory = await prisma.subCategory.update({
      where: { id: subId },
      data: updateData
    });

    res.send(subCategory);

  } catch (err) {
    // 6. ดักจับ Error กรณีหา ID ไม่เจอ (P2025)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return res.status(404).json({ message: "SubCategory not found" });
    }
    console.log(err);
    res.status(500).json({ message: "update subcategory controller Error" });
  }
};