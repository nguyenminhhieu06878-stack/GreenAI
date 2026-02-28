# 🤝 Contributing to GreenEnergy AI

Cảm ơn bạn đã quan tâm đến việc đóng góp cho GreenEnergy AI! Chúng tôi rất hoan nghênh mọi đóng góp từ cộng đồng.

## 📋 Quy trình đóng góp

### 1. Fork và Clone

```bash
# Fork repository trên GitHub
# Clone fork của bạn
git clone https://github.com/YOUR_USERNAME/greenenergy-ai.git
cd greenenergy-ai

# Thêm upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/greenenergy-ai.git
```

### 2. Tạo Branch mới

```bash
# Tạo branch từ main
git checkout -b feature/your-feature-name

# Hoặc cho bug fix
git checkout -b fix/bug-description
```

### 3. Phát triển

```bash
# Cài đặt dependencies
npm run install:all

# Chạy development server
npm run dev

# Viết code và test
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit với message rõ ràng
git commit -m "feat: add new feature description"
```

#### Commit Message Convention

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Tính năng mới
- `fix:` - Sửa bug
- `docs:` - Cập nhật documentation
- `style:` - Format code, không thay đổi logic
- `refactor:` - Refactor code
- `test:` - Thêm hoặc sửa tests
- `chore:` - Cập nhật build tools, dependencies

### 5. Push và Pull Request

```bash
# Push branch lên fork của bạn
git push origin feature/your-feature-name

# Tạo Pull Request trên GitHub
```

## 🎯 Guidelines

### Code Style

- **TypeScript**: Sử dụng TypeScript cho type safety
- **ESLint**: Code phải pass ESLint rules
- **Formatting**: Sử dụng Prettier (nếu có)
- **Naming**: 
  - Components: PascalCase (`UserProfile.tsx`)
  - Functions: camelCase (`getUserData()`)
  - Constants: UPPER_SNAKE_CASE (`API_URL`)

### Component Structure

```tsx
// 1. Imports
import { useState } from 'react'
import { SomeIcon } from 'lucide-react'

// 2. Types/Interfaces
interface MyComponentProps {
  title: string
  onAction: () => void
}

// 3. Component
export default function MyComponent({ title, onAction }: MyComponentProps) {
  // 4. Hooks
  const [state, setState] = useState()
  
  // 5. Functions
  const handleClick = () => {
    // ...
  }
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### API Routes

```typescript
// routes/feature.routes.ts
import { Router } from 'express'
import { controller } from '../controllers/feature.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, controller.getAll)
router.post('/', authenticate, controller.create)

export default router
```

## 🧪 Testing

```bash
# Chạy tests (khi có)
npm test

# Chạy linter
npm run lint
```

## 📝 Documentation

- Cập nhật README.md nếu thêm tính năng mới
- Thêm JSDoc comments cho functions phức tạp
- Cập nhật API.md nếu thay đổi API

## ❓ Câu hỏi?

- Mở [GitHub Issue](https://github.com/OWNER/greenenergy-ai/issues)
- Hoặc liên hệ team qua email

## 🎉 Cảm ơn!

Mọi đóng góp, dù lớn hay nhỏ, đều được trân trọng!
