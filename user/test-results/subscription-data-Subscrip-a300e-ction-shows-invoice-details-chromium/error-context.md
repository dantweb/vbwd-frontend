# Page snapshot

```yaml
- generic [ref=e4]:
  - complementary [ref=e5]:
    - heading "VBWD" [level=2] [ref=e7]
    - navigation [ref=e8]:
      - link "Dashboard" [ref=e9] [cursor=pointer]:
        - /url: /dashboard
      - link "Profile" [ref=e10] [cursor=pointer]:
        - /url: /profile
      - link "Subscription" [ref=e11] [cursor=pointer]:
        - /url: /subscription
      - link "Invoices" [ref=e12] [cursor=pointer]:
        - /url: /invoices
      - link "Plans" [ref=e13] [cursor=pointer]:
        - /url: /plans
    - generic [ref=e14] [cursor=pointer]: User
  - main [ref=e15]:
    - generic [ref=e16]:
      - heading "Invoice Details" [level=1] [ref=e17]
      - generic [ref=e18]:
        - paragraph [ref=e19]: Not found
        - link "Back to Subscription" [ref=e20] [cursor=pointer]:
          - /url: /subscription
```