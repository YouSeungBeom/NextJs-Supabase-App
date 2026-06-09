import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettierConfig from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "shrimp_data/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Prettier와 충돌하는 스타일 규칙 비활성화 (반드시 마지막 순서)
  prettierConfig,
  {
    rules: {
      // _로 시작하면 미사용 변수 허용 (Next.js params/props 패턴 대응)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // any 타입 경고 (서드파티 연동 시 불가피한 경우 있음)
      "@typescript-eslint/no-explicit-any": "warn",
      // warn/error 레벨 console은 허용, log는 경고
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];

export default eslintConfig;
