import {
  Card,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sum } from "lodash-es";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Button from "../../../../components/Button";
import { useAuth } from "../../../../hooks/useAuth";
import { deleteSale, getMembers, getSales } from "../../../../services/api";
import { formatCurrency } from "../../../../util/formatCurrency";
import * as S from "../styles";

export default function Sales() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [memberFilter, setMemberFilter] = useState<number>();
  const [groupFilter, setGroupFilter] = useState<number>();
  const [startDateFilter, setStartDateFilter] = useState<Date>();
  const [endDateFilter, setEndDateFilter] = useState<Date>();
  const queryClient = useQueryClient();
  const filters = {
    memberId: memberFilter,
    groupId: groupFilter,
    startDate: startDateFilter,
    endDate: endDateFilter,
  };
  const { data: members } = useQuery({
    queryKey: ["members"],
    queryFn: () => getMembers(token!),
  });
  const groups = Array.from(
    new Map(members?.map((member) => [member.group.id, member.group])).values(),
  );
  const { data: sales } = useQuery({
    queryKey: ["sales", filters],
    queryFn: () => getSales(token!, filters),
  });
  const { mutate: del } = useMutation({
    mutationFn: (id: number) => deleteSale(token!, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  return (
    <S.Container>
      <S.Header>
        <h1>Vendas</h1>
        <Button as={Link} to="new" variant="dark">
          Nova Venda
        </Button>
      </S.Header>

      <Card
        sx={{
          padding: "25px",
          gap: "8px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <S.CardHeader>
          <S.Title>Vendas</S.Title>
          <S.Filters>
            <Autocomplete
              sx={{ width: 300 }}
              size="small"
              onChange={(_, value) => setMemberFilter(value?.id)}
              getOptionLabel={(option) => option.name}
              options={[
                { name: "Todos os membros", id: undefined },
                ...(members ?? []),
              ]}
              autoSelect
              disableClearable
              defaultValue={{ name: "Todos os membros", id: undefined }}
              renderInput={(params) => (
                <TextField {...params} label="Filtrar membros" />
              )}
            />
            <Autocomplete
              sx={{ width: 300 }}
              size="small"
              onChange={(_, value) => setGroupFilter(value?.id)}
              getOptionLabel={(option) => option.name}
              options={[
                { name: "Todos os grupos", id: undefined },
                ...(groups ?? []),
              ]}
              autoSelect
              disableClearable
              defaultValue={{ name: "Todos os grupos", id: undefined }}
              renderInput={(params) => (
                <TextField {...params} label="Filtrar grupos" />
              )}
            />
            <DatePicker
              label="Início"
              slotProps={{ textField: { size: "small" } }}
              onChange={(date) => setStartDateFilter(date?.toDate())}
            />
            <DatePicker
              label="Fim"
              slotProps={{ textField: { size: "small" } }}
              onChange={(date) => setEndDateFilter(date?.toDate())}
            />
          </S.Filters>
        </S.CardHeader>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales?.map((sale) => (
              <TableRow
                key={sale.id}
                onClick={() => navigate(`edit/${sale.id}`)}
                sx={{
                  cursor: "pointer",
                  ":hover": { backgroundColor: "#f8f8f8" },
                }}
              >
                <TableCell sx={{ width: "33%" }}>
                  {sale.date.toLocaleDateString()}
                </TableCell>
                <TableCell sx={{ width: "33%" }}>{sale.member.name}</TableCell>
                <TableCell sx={{ width: "33%" }}>
                  {formatCurrency(
                    sum(
                      sale.saleItems.map(
                        (item) =>
                          item.quantity * Number(item.productPrice.price),
                      ),
                    ),
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    sx={{ color: "red" }}
                    onClick={() => del(sale.id)}
                  >
                    <Trash2 />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) ?? null}
          </TableBody>
        </Table>
      </Card>
    </S.Container>
  );
}
