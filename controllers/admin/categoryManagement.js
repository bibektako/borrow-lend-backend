const Category = require('../../models/Category');
const fs = require('fs'); 
const path = require('path'); 

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private
 */
exports.createCategory = async (req, res) => {
    const { name, imageUrl } = req.body;

    // Basic validation
    if (!name || !imageUrl) {
        return res.status(400).json({ success: false, message: 'Please provide a name and an imageUrl' });
    }

    try {
        // Check if category with the same name already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: 'A category with this name already exists.' });
        }

        const category = new Category({
            name,
            imageUrl,
        });

        await category.save();

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });
    } catch (err) {
        // Handle other potential errors, e.g., validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.json({ success: true, count: categories.length, data: categories, message: "All categories fetched" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Get a single category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        return res.json({ success: true, data: category, message: "Category fetched" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private
 */
exports.updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const newImageUrl = req.body.imageUrl;

        const updateData = {};
        if (name) {
            updateData.name = name;
        }
        if (newImageUrl) {
            updateData.imageUrl = newImageUrl;
        }

        // Check if there is anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: 'No update data provided.' });
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true } 
        );

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        return res.json({ success: true, data: category, message: "Category updated successfully" });
    } catch (err) {
        
        if (err.code === 11000) {
             return res.status(400).json({ success: false, message: 'A category with this name already exists.' });
        }
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
exports.deleteCategory = async (req, res) => {
    try {
        // First, find the category to get its imageUrl
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

       
        try {
            
            const filename = path.basename(new URL(category.imageUrl).pathname);
            const localImagePath = path.join(__dirname, '..', '..', 'public', 'uploads', filename); 

            if (fs.existsSync(localImagePath)) {
                fs.unlinkSync(localImagePath);
                console.log(`Deleted image file: ${localImagePath}`);
            }
        } catch (fileError) {
            console.error(`Error deleting image file for category ${category._id}:`, fileError.message);
            // Decide if you want to stop the process or just log the error and continue deleting the DB entry
        }
        
        await Category.findByIdAndDelete(req.params.id);

        return res.json({ success: true, message: 'Category and associated image deleted successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};