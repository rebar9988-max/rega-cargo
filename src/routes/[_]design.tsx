import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Shell, PageHeader } from "@/components/shell";
import {
  Badge,
  BottomSheet,
  Button,
  Card,
  Chip,
  Icon,
  Input,
  Modal,
  Price,
  Select,
  Skeleton,
  ThemeToggle,
} from "@/components/ui";
import { Field } from "@/components/field";
import { useI18n } from "@/lib/i18n";
import { redesignCopy } from "@/lib/redesign-copy";
import { langMeta, type Lang } from "@/lib/langs";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/_design")({
  head: () => seo({ path: "/_design", title: "R&L", description: "R&L", noindex: true }),
  component: DesignPage,
});
function DesignPage() {
  const { lang, setLang } = useI18n();
  const c = redesignCopy(lang);
  const [modal, setModal] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [selected, setSelected] = useState(true);
  return (
    <Shell>
      <PageHeader kicker="R&L" title={c.designTitle} lede={c.designLede} />
      <div className="page rl-section rl-stack">
        <div className="rl-row">
          {(["ckb", "ar", "en"] as Lang[]).map((l) => (
            <Chip key={l} selected={l === lang} onClick={() => setLang(l)}>
              {langMeta(l).name}
            </Chip>
          ))}
          <ThemeToggle />
        </div>
        <div className="rl-dev-grid">
          <Card className="rl-stack">
            <h2>{c.card}</h2>
            <p>{c.cardBody}</p>
            <div className="rl-row">
              <Button>
                {c.primary}
                <Icon as={ArrowRight} directional />
              </Button>
              <Button variant="secondary">{c.secondary}</Button>
              <Button variant="ghost">{c.ghost}</Button>
              <Button variant="danger">{c.danger}</Button>
              <Button disabled>{c.primary}</Button>
              <Button loading>{c.loading}</Button>
            </div>
          </Card>
          <Card className="rl-stack">
            <Field label={c.input}>
              <Input placeholder={c.input} />
            </Field>
            <Field label={c.select}>
              <Select>
                <option>{c.select}</option>
              </Select>
            </Field>
            <Badge tone="accent">{c.badge}</Badge>
            <Chip selected={selected} onClick={() => setSelected(!selected)}>
              {c.chip}
            </Chip>
          </Card>
          <Card className="rl-stack">
            <Price eur={0} />
            <p>{c.exampleTitle}</p>
            <Skeleton />
            <Button variant="secondary" onClick={() => setModal(true)}>
              {c.modal}
            </Button>
            <Button variant="secondary" onClick={() => setSheet(true)}>
              {c.sheet}
            </Button>
          </Card>
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={c.card}>
        <p>{c.cardBody}</p>
      </Modal>
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title={c.card}>
        <p>{c.cardBody}</p>
      </BottomSheet>
    </Shell>
  );
}
