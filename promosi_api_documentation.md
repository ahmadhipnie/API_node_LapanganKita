# Promosi API Documentation

## Deskripsi
API Promosi digunakan untuk mengelola gambar-gambar promosi yang akan ditampilkan sebagai image slider di aplikasi Android. API ini menyediakan endpoint untuk upload, update, delete, dan retrieve gambar promosi dengan automatic file management.

## Base URL
```
http://localhost:3000/api/promosi
```

## Storage Location
Semua gambar promosi disimpan di folder: `uploads/promosi/`

## Business Rules
1. ✅ Gambar promosi untuk keperluan image slider Android
2. ✅ File foto adalah mandatory untuk create promosi
3. ✅ Update promosi akan mengganti gambar lama dengan yang baru
4. ✅ Delete promosi akan menghapus gambar dari storage secara otomatis
5. ✅ Support file JPG, PNG, GIF dengan maksimal 10MB
6. ✅ Endpoint khusus untuk mobile app (optimized response)

## Endpoints

### 1. Create Promosi
**POST** `/api/promosi`

Membuat promosi baru dengan upload gambar.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file_photo` (file): File gambar promosi (JPG, PNG, GIF max 10MB)

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/promosi \
  -F "file_photo=@/path/to/promo_image.jpg"
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Promosi berhasil dibuat",
  "data": {
    "promosi_id": 1,
    "file_photo": "uploads/promosi/promosi_1728123456789_promo_image.jpg",
    "file_photo_url": "http://localhost:3000/uploads/promosi/promosi_1728123456789_promo_image.jpg",
    "created_at": "2025-10-04T12:00:00.000Z"
  }
}
```

**Error Responses:**
```json
// No file uploaded
{
  "success": false,
  "message": "File foto diperlukan untuk promosi"
}

// File too large
{
  "success": false,
  "message": "File terlalu besar. Maksimal 10MB"
}

// Invalid file type
{
  "success": false,
  "message": "File harus berupa gambar (JPG, PNG, GIF, dll)"
}
```

### 2. Get All Promosi
**GET** `/api/promosi`

Mendapatkan semua promosi dengan full URL untuk admin dashboard.

**Example cURL:**
```bash
curl http://localhost:3000/api/promosi
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data promosi berhasil diambil",
  "count": 3,
  "data": [
    {
      "id": 1,
      "file_photo": "uploads/promosi/promosi_1728123456789_promo1.jpg",
      "file_photo_url": "http://localhost:3000/uploads/promosi/promosi_1728123456789_promo1.jpg",
      "created_at": "2025-10-04T12:00:00.000Z",
      "updated_at": "2025-10-04T12:00:00.000Z"
    },
    {
      "id": 2,
      "file_photo": "uploads/promosi/promosi_1728123456790_promo2.jpg",
      "file_photo_url": "http://localhost:3000/uploads/promosi/promosi_1728123456790_promo2.jpg",
      "created_at": "2025-10-04T11:00:00.000Z",
      "updated_at": "2025-10-04T11:00:00.000Z"
    }
  ]
}
```

### 3. Get Promosi for Android Slider (Optimized)
**GET** `/api/promosi/slider`

Endpoint khusus untuk aplikasi Android dengan response yang dioptimasi untuk image slider.

**Example cURL:**
```bash
curl http://localhost:3000/api/promosi/slider
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Slider images berhasil diambil",
  "count": 3,
  "images": [
    {
      "id": 1,
      "image_url": "http://localhost:3000/uploads/promosi/promosi_1728123456789_promo1.jpg",
      "created_at": "2025-10-04T12:00:00.000Z"
    },
    {
      "id": 2,
      "image_url": "http://localhost:3000/uploads/promosi/promosi_1728123456790_promo2.jpg",
      "created_at": "2025-10-04T11:00:00.000Z"
    }
  ]
}
```

### 4. Get Promosi by ID
**GET** `/api/promosi/:id`

**Example cURL:**
```bash
curl http://localhost:3000/api/promosi/1
```

### 5. Get Promosi Count
**GET** `/api/promosi/count`

Mendapatkan jumlah total promosi yang tersedia.

**Example cURL:**
```bash
curl http://localhost:3000/api/promosi/count
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Jumlah promosi berhasil diambil",
  "data": {
    "total_promosi": 5
  }
}
```

### 6. Update Promosi
**PUT** `/api/promosi/:id`

Update promosi dengan mengganti gambar lama. Gambar lama akan dihapus otomatis.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file_photo` (file): File gambar promosi baru

**Example cURL:**
```bash
curl -X PUT http://localhost:3000/api/promosi/1 \
  -F "file_photo=@/path/to/new_promo_image.jpg"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Promosi berhasil diupdate",
  "data": {
    "id": 1,
    "file_photo": "uploads/promosi/promosi_1728123456999_new_promo.jpg",
    "file_photo_url": "http://localhost:3000/uploads/promosi/promosi_1728123456999_new_promo.jpg",
    "created_at": "2025-10-04T12:00:00.000Z",
    "updated_at": "2025-10-04T13:00:00.000Z"
  }
}
```

### 7. Delete Promosi
**DELETE** `/api/promosi/:id`

Menghapus promosi dan file gambar dari storage.

**Example cURL:**
```bash
curl -X DELETE http://localhost:3000/api/promosi/1
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Promosi berhasil dihapus",
  "data": {
    "deleted_promosi_id": "1",
    "deleted_file": "uploads/promosi/promosi_1728123456789_promo1.jpg"
  }
}
```

## Android Integration Examples

### Kotlin/Java - Load Slider Images
```kotlin
// Retrofit Service Interface
interface PromosiService {
    @GET("api/promosi/slider")
    suspend fun getSliderImages(): Response<SliderResponse>
}

// Data Classes
data class SliderResponse(
    val success: Boolean,
    val message: String,
    val count: Int,
    val images: List<SliderImage>
)

data class SliderImage(
    val id: Int,
    val image_url: String,
    val created_at: String
)

// Usage in Activity/Fragment
class MainActivity : AppCompatActivity() {
    private lateinit var viewPager: ViewPager2
    private lateinit var sliderAdapter: SliderAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        setupSlider()
        loadSliderImages()
    }
    
    private fun setupSlider() {
        viewPager = findViewById(R.id.viewPager)
        sliderAdapter = SliderAdapter()
        viewPager.adapter = sliderAdapter
    }
    
    private fun loadSliderImages() {
        lifecycleScope.launch {
            try {
                val response = promosiService.getSliderImages()
                if (response.isSuccessful && response.body()?.success == true) {
                    val images = response.body()?.images ?: emptyList()
                    sliderAdapter.updateImages(images)
                }
            } catch (e: Exception) {
                Log.e("MainActivity", "Error loading slider images", e)
            }
        }
    }
}

// Slider Adapter
class SliderAdapter : RecyclerView.Adapter<SliderAdapter.SliderViewHolder>() {
    private var images = listOf<SliderImage>()
    
    fun updateImages(newImages: List<SliderImage>) {
        images = newImages
        notifyDataSetChanged()
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SliderViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_slider, parent, false)
        return SliderViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: SliderViewHolder, position: Int) {
        val image = images[position]
        Glide.with(holder.itemView.context)
            .load(image.image_url)
            .placeholder(R.drawable.placeholder)
            .error(R.drawable.error_image)
            .into(holder.imageView)
    }
    
    override fun getItemCount() = images.size
    
    class SliderViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val imageView: ImageView = itemView.findViewById(R.id.imageView)
    }
}
```

### Flutter/Dart - Load Slider Images
```dart
// Models
class SliderResponse {
  final bool success;
  final String message;
  final int count;
  final List<SliderImage> images;

  SliderResponse({
    required this.success,
    required this.message,
    required this.count,
    required this.images,
  });

  factory SliderResponse.fromJson(Map<String, dynamic> json) {
    return SliderResponse(
      success: json['success'],
      message: json['message'],
      count: json['count'],
      images: (json['images'] as List)
          .map((i) => SliderImage.fromJson(i))
          .toList(),
    );
  }
}

class SliderImage {
  final int id;
  final String imageUrl;
  final String createdAt;

  SliderImage({
    required this.id,
    required this.imageUrl,
    required this.createdAt,
  });

  factory SliderImage.fromJson(Map<String, dynamic> json) {
    return SliderImage(
      id: json['id'],
      imageUrl: json['image_url'],
      createdAt: json['created_at'],
    );
  }
}

// Service
class PromosiService {
  static const String baseUrl = 'http://localhost:3000/api';

  static Future<SliderResponse> getSliderImages() async {
    final response = await http.get(Uri.parse('$baseUrl/promosi/slider'));
    
    if (response.statusCode == 200) {
      return SliderResponse.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load slider images');
    }
  }
}

// Widget
class PromoSlider extends StatefulWidget {
  @override
  _PromoSliderState createState() => _PromoSliderState();
}

class _PromoSliderState extends State<PromoSlider> {
  List<SliderImage> images = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    loadSliderImages();
  }

  Future<void> loadSliderImages() async {
    try {
      final response = await PromosiService.getSliderImages();
      setState(() {
        images = response.images;
        isLoading = false;
      });
    } catch (e) {
      print('Error loading slider images: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    return Container(
      height: 200,
      child: PageView.builder(
        itemCount: images.length,
        itemBuilder: (context, index) {
          return Container(
            margin: EdgeInsets.symmetric(horizontal: 8),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                images[index].imageUrl,
                fit: BoxFit.cover,
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return Center(child: CircularProgressIndicator());
                },
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: Colors.grey[300],
                    child: Icon(Icons.error),
                  );
                },
              ),
            ),
          );
        },
      ),
    );
  }
}
```

## JavaScript Fetch Examples

### Load Slider Images for Web
```javascript
const loadSliderImages = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/promosi/slider');
    const data = await response.json();
    
    if (data.success) {
      const sliderContainer = document.getElementById('slider-container');
      sliderContainer.innerHTML = '';
      
      data.images.forEach(image => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.innerHTML = `
          <img src="${image.image_url}" alt="Promosi ${image.id}">
        `;
        sliderContainer.appendChild(slide);
      });
      
      // Initialize slider (example with basic implementation)
      initializeSlider();
    }
  } catch (error) {
    console.error('Error loading slider images:', error);
  }
};

// React Component Example
const PromoSlider = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/promosi/slider');
        const data = await response.json();
        
        if (data.success) {
          setImages(data.images);
        }
      } catch (error) {
        console.error('Error fetching slider images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="slider-container">
      {images.map(image => (
        <div key={image.id} className="slide">
          <img src={image.image_url} alt={`Promo ${image.id}`} />
        </div>
      ))}
    </div>
  );
};
```

### Admin Upload Example
```javascript
const uploadPromoImage = async (file) => {
  const formData = new FormData();
  formData.append('file_photo', file);

  try {
    const response = await fetch('http://localhost:3000/api/promosi', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log(data);
    
    if (data.success) {
      alert('Promosi berhasil diupload!');
      // Refresh slider or add to existing images
      loadSliderImages();
    }
  } catch (error) {
    console.error('Error uploading image:', error);
  }
};

// HTML form handling
document.getElementById('upload-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];
  
  if (file) {
    uploadPromoImage(file);
  }
});
```

## Postman Collection

### Get Slider Images
- **Method**: GET
- **URL**: `http://localhost:3000/api/promosi/slider`

### Upload Promosi
- **Method**: POST
- **URL**: `http://localhost:3000/api/promosi`
- **Body Type**: form-data
- **Form Fields**:
  - file_photo: [select file] (file)

### Update Promosi
- **Method**: PUT
- **URL**: `http://localhost:3000/api/promosi/1`
- **Body Type**: form-data
- **Form Fields**:
  - file_photo: [select file] (file)

## File Management

### Automatic File Cleanup
- ✅ **Create**: File disimpan di `uploads/promosi/`
- ✅ **Update**: File lama dihapus, file baru disimpan
- ✅ **Delete**: File dihapus dari storage
- ✅ **Error Handling**: File dihapus jika database operation gagal

### File Naming Convention
```
promosi_{timestamp}_{originalname}
Example: promosi_1728123456789_promo_image.jpg
```

### Storage Structure
```
uploads/
└── promosi/
    ├── promosi_1728123456789_promo1.jpg
    ├── promosi_1728123456790_promo2.jpg
    └── promosi_1728123456791_promo3.png
```

## Database Schema

```sql
CREATE TABLE `promosi` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `file_photo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Usage Flow for Android App

1. **App Launch**: Call `GET /api/promosi/slider` untuk mendapatkan daftar gambar
2. **Display Slider**: Tampilkan gambar dalam ViewPager2 atau PageView
3. **Auto Refresh**: Periodic call untuk update slider images
4. **Caching**: Implement image caching untuk performa lebih baik

## Usage Flow for Admin

1. **View Promosi**: Call `GET /api/promosi` untuk melihat semua promosi
2. **Add Promosi**: Upload gambar via `POST /api/promosi`
3. **Update Promosi**: Replace gambar via `PUT /api/promosi/:id`
4. **Delete Promosi**: Remove promosi via `DELETE /api/promosi/:id`

## Performance Considerations

1. **Image Optimization**: Compress gambar sebelum upload
2. **Caching**: Implement browser/app caching untuk images
3. **CDN**: Consider using CDN untuk production
4. **Lazy Loading**: Implement lazy loading untuk multiple images
5. **Size Limit**: 10MB limit untuk maintain reasonable storage

## Security Considerations

1. **File Type Validation**: Hanya accept image files
2. **File Size Limit**: 10MB maximum
3. **File Name Sanitization**: Auto-generated unique names
4. **Storage Security**: Files stored outside web root when possible
5. **Access Control**: Consider adding admin authentication

## Error Handling

- **400**: Bad Request (file validation errors)
- **404**: Not Found (promosi not found)
- **500**: Internal Server Error

## Tips & Best Practices

1. **Image Quality**: Use high-quality images untuk promotional slider
2. **Consistent Dimensions**: Maintain consistent aspect ratio
3. **Optimize Size**: Balance quality vs file size
4. **Regular Cleanup**: Monitor storage usage
5. **Backup Strategy**: Implement backup untuk promotional images
6. **Version Control**: Consider versioning untuk promotional campaigns